import { createStaticCamera } from "../camera";
import {
  flattenMatrix,
  generateMatrixFromOperations,
  IDENTITY_MATRIX,
  invertMatrix,
  Matrix3D,
  multiplyMatrixes,
} from "../math/helpers";

let _glContext: WebGLRenderingContext;
let _cameraMatrix: Matrix3D;

export function setGLContext(glContext: WebGLRenderingContext) {
  _glContext = glContext;
  glContext.clearColor(0, 0, 0, 0.8);
  glContext.clear(glContext.COLOR_BUFFER_BIT);
  // glContext.enable(glContext.CULL_FACE);
  glContext.enable(glContext.DEPTH_TEST);
  glContext.viewport(0, 0, glContext.canvas.width, glContext.canvas.height);
}

export function getGLContext() {
  return _glContext;
}

export function setCameraPosition(whereIsIt: Coordinate) {
  _cameraMatrix = createStaticCamera(whereIsIt, [0, 0, 0]);
}

/**
 *
 * @param vertexes List of number defining vertexes
 * @param positionInSpace
 */
export function drawObject(vertexes: number[], transformationMatrix: Matrix3D) {
  if (process.env.NODE_ENV === "development") {
    if (vertexes.length % 3 !== 0)
      throw new Error(
        "The provided vertexes are not a multiple of 3, the object will not be drawn"
      );
  }

  const resultingMatrix = multiplyMatrixes(transformationMatrix, _cameraMatrix);
}

type A = "position" | "scale" | "rotation";
type B = `_${A}`;

export class ObjectModel<P extends Program<any, any>> {
  _program!: P;
  _glContext: WebGLRenderingContext = getGLContext();
  _vertexes!: number;
  _position: Coordinate = [0, 0, 0];
  _rotation: Coordinate = [0, 0, 0];
  _scale: Coordinate = [1, 1, 1];
  _buffers: {
    [k in keyof P["attributes"]]?: {
      ref: WebGLBuffer;
      dim: number;
      type: number;
      norm: boolean;
    };
  } = {};
  temp: any = [];

  // The matrix that puts us on the center
  _centerTranslationMatrix!: Matrix3D;

  // The matrix that puts us on the center
  _cameraMatrix!: Matrix3D;

  // The matrix for the transformation of this model
  _transformationMatrix: Matrix3D = IDENTITY_MATRIX();

  //Other transformations matrix
  _otherTransformationMatrixes: Matrix3D = IDENTITY_MATRIX();

  constructor(program: P) {
    this._program = program;
  }

  setCamera(matrix: Matrix3D) {
    this._cameraMatrix = matrix;
  }

  load(
    a: keyof P["attributes"],
    data: Float32Array | Uint8Array,
    dimensions: number = 3,
    normalize: boolean = false
  ) {
    let glType: number;
    switch (data.constructor.name) {
      case "Float32Array":
        glType = this._glContext.FLOAT;
        break;
      case "Uint8Array":
        glType = this._glContext.UNSIGNED_BYTE;
        break;
      default:
        throw new Error("You are trying to load data that isn't mapped yet");
    }
    if (!this._buffers[a]) {
      this._buffers[a] = {
        ref: this._glContext.createBuffer()!,
        dim: dimensions,
        type: glType,
        norm: normalize,
      };
    }
    const bufferRef = this._buffers[a]!.ref;

    this.temp.push(bufferRef);
    this._glContext.useProgram(this._program.program);
    this._glContext.bindBuffer(this._glContext.ARRAY_BUFFER, bufferRef);
    this._glContext.enableVertexAttribArray(this._program.attributes[a]!);
    this._glContext.bufferData(
      this._glContext.ARRAY_BUFFER,
      data,
      this._glContext.STATIC_DRAW
    );
    switch (a) {
      case "a_vertex":
        const max = [0, 0, 0];
        data.forEach((v, i) => {
          const index = i % dimensions;
          const curr = max[index];
          if (v > curr) max[index] = v;
        });
        this._centerTranslationMatrix = generateMatrixFromOperations({
          type: "translate",
          x: -max[0] / 2,
          y: -max[1] / 2,
          z: -max[2] / 2,
        });
        this.set("position", [0, 0, 0]);
        this._vertexes = data.length / dimensions;
        break;
    }
  }

  set(whichParam: "position" | "scale" | "rotation", coordinates: Coordinate) {
    this[`_${whichParam}` as `_${typeof whichParam}`] = coordinates;
    this._transformationMatrix = generateMatrixFromOperations(
      {
        type: "matrix",
        matrix: this._centerTranslationMatrix,
      },
      {
        type: "scale",
        factorX: this._scale[0],
        factorY: this._scale[1],
        factorZ: this._scale[2],
      },
      {
        type: "rotateX",
        angle: this._rotation[0],
      },
      {
        type: "rotateY",
        angle: this._rotation[1],
      },
      {
        type: "rotateZ",
        angle: this._rotation[2],
      },
      {
        type: "translate",
        x: this._position[0],
        y: this._position[1],
        z: this._position[2],
      }
    );
  }

  _computeMatrix() {
    if (!this._cameraMatrix) return;
    this._glContext.useProgram(this._program.program);
    this._glContext.uniformMatrix4fv(
      this._program.uniforms.u_transformMatrix!,
      false,
      flattenMatrix(
        multiplyMatrixes(
          multiplyMatrixes(
            this._transformationMatrix,
            this._otherTransformationMatrixes
          ) as Matrix3D,
          this._cameraMatrix
        )
      )
    );
  }

  draw() {
    if (!this._cameraMatrix)
      throw new Error("Trying to draw without camera matrix");
    this._glContext.useProgram(this._program.program);
    this._computeMatrix();

    Object.keys(this._buffers).forEach((b) => {
      this._glContext.bindBuffer(
        _glContext.ARRAY_BUFFER,
        this._buffers[b]!.ref
      );
      this._glContext.vertexAttribPointer(
        this._program.attributes[b]!,
        this._buffers[b]!.dim,
        this._buffers[b]!.type,
        this._buffers[b]!.norm,
        0,
        0
      );
    });

    this._glContext.drawArrays(this._glContext.TRIANGLES, 0, this._vertexes);
  }
}

type ProgramAttributes<A extends string> = {
  [k in A]?: number;
} & {
  a_vertex?: number;
};
type ProgramUniforms<U extends string> = {
  [k in U]?: WebGLUniformLocation;
} & {
  u_transformMatrix?: WebGLUniformLocation;
};

type SUPPORTED_TYPES =
  | WebGLRenderingContext["VERTEX_SHADER"]
  | WebGLRenderingContext["FRAGMENT_SHADER"];

export abstract class Program<A extends string, U extends string> {
  _glContext: WebGLRenderingContext = getGLContext();
  program!: WebGLProgram;
  attributes: ProgramAttributes<A> = {};
  uniforms: ProgramUniforms<U> = {};

  constructor() {
    this.loadShaders();
    this.attributes.a_vertex = this._glContext.getAttribLocation(
      this.program,
      "a_vertex"
    );
    this.uniforms.u_transformMatrix = this._glContext.getUniformLocation(
      this.program,
      "u_transformMatrix"
    )!;
  }

  _createShader(type: SUPPORTED_TYPES, source: string) {
    const shader = this._glContext.createShader(type)!;
    this._glContext.shaderSource(shader, source);
    this._glContext.compileShader(shader);
    const success = this._glContext.getShaderParameter(
      shader,
      this._glContext.COMPILE_STATUS
    );
    if (success) {
      return shader;
    }

    console.log(this._glContext.getShaderInfoLog(shader));
    throw new Error(
      "There was an error loading the shader. Check the logs for details"
    );
  }

  _createProgram(vertexShader: string, fragmentShader: string) {
    const _vertexShader: WebGLShader = this._createShader(
      this._glContext.VERTEX_SHADER,
      vertexShader
    )!;
    const _fragmentShader: WebGLShader = this._createShader(
      this._glContext.FRAGMENT_SHADER,
      fragmentShader
    )!;
    const program = this._glContext.createProgram()!;
    this._glContext.attachShader(program, _vertexShader);
    this._glContext.attachShader(program, _fragmentShader);
    this._glContext.linkProgram(program);
    const success = this._glContext.getProgramParameter(
      program,
      this._glContext.LINK_STATUS
    );
    if (success) {
      this.program = program;
    } else {
      console.log(this._glContext.getProgramInfoLog(program));
      throw new Error(
        "There was an error loading the program. Check the logs for details"
      );
    }
  }

  abstract loadShaders(): void;
}
