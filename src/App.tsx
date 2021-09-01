import React from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { resizeCanvasToDisplaySize } from "./helpers";
import initSimpleShader from "./shaders/simpleExample";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  flattenMatrix,
  generateMatrixFromOperations,
  invertMatrix,
  rotate,
} from "./math/helpers";
import { cube } from "./objects/square";
import { generateCameraLookTo } from "./camera";

type Programs = {
  simpleExample: ReturnType<typeof initSimpleShader>;
};
type AvailableObjects = "simpleTriangle";
type Buffers = {
  simpleTriangle: "color" | "position";
};
type Objects = {
  [key in AvailableObjects]: { [key2 in Buffers[key]]: WebGLBuffer };
};

const CUBE = cube(100);

console.warn(
  CUBE.color
    .reduce((r, i, index) => {
      const arr = r[Math.floor(index / 3)];
      if (!arr) r[Math.floor(index / 3)] = [i];
      else arr.push(i);
      return r;
    }, [] as number[][])
    .map((i) => i.join(","))
    .join("\n")
);
console.warn(CUBE.data.length);

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContextRef = useRef<WebGLRenderingContext>();
  const programsRef = useRef<Programs>({} as any);
  const lookAtRef = useRef<[number, number, number]>([0, 0, 0]);
  const positionBuffersRef = useRef<Objects>({
    simpleTriangle: {},
  } as any);
  useEffect(() => {
    resizeCanvasToDisplaySize(canvasRef.current!);
    const glContext = canvasRef.current!.getContext("webgl")!;
    canvasContextRef.current = glContext!;
    glContext.clearColor(0, 0, 0, 1);
    glContext.clear(glContext.COLOR_BUFFER_BIT);
    programsRef.current.simpleExample = initSimpleShader(glContext);

    /** @importante É ncessário 'ativar' o programa antes de declarar suas variaveis */
    glContext.useProgram(programsRef.current.simpleExample.program);
    // Define os valores requeridos

    function _loadTriangleVertices() {
      const positionBuffer = glContext.createBuffer()!;
      const colorBuffer = glContext.createBuffer()!;
      glContext.bindBuffer(glContext.ARRAY_BUFFER, positionBuffer);
      glContext.bufferData(
        glContext.ARRAY_BUFFER,
        new Float32Array(CUBE.data),
        glContext.STATIC_DRAW
      );
      glContext.bindBuffer(glContext.ARRAY_BUFFER, colorBuffer);
      glContext.bufferData(
        glContext.ARRAY_BUFFER,
        new Uint8Array(CUBE.color),
        glContext.STATIC_DRAW
      );
      positionBuffersRef.current.simpleTriangle.position = positionBuffer;
      positionBuffersRef.current.simpleTriangle.color = colorBuffer;
    }

    _loadTriangleVertices();
    _render();
    // alert(glContext.geterror());
  });

  const magic = useRef({
    transform: [0, 0, 0],
    rotate: [0],
    scale: [1, 1, 1],
  });
  useEffect(() => {
    window.addEventListener("keydown", ({ key }) => {
      if (key === "ArrowUp") lookAtRef.current[1] += 1;
      if (key === "ArrowDown") lookAtRef.current[1] -= 1;
      if (key === "ArrowRight") lookAtRef.current[0] += 1;
      if (key === "ArrowLeft") lookAtRef.current[0] -= 1;
    });
    let then = 0;
    setInterval(() => {
      requestAnimationFrame((now) => {
        // Convert the time to seconds
        now *= 0.001;
        // Subtract the previous time from the current time
        const deltaTime = now - then;

        // Remember the current time for the next frame.
        then = now;

        const error = canvasContextRef.current!.getError();
        if (error !== canvasContextRef.current!.NO_ERROR)
          toast(
            "Hey dumbass, something has gone wrong with webgl. Check the logs. Code: " +
              error
          );
        else {
          if (magic.current.rotate[0] < 360) {
            magic.current.rotate[0] += 360 * deltaTime;
          } else {
            magic.current.rotate[0] = 360 * deltaTime;
            if (Math.random() < 0.5) {
              magic.current.scale[0] += 0.1;
            } else {
              magic.current.scale[1] += 0.1;
            }
          }

          _render();
        }
      });
    }, 1000 / 120);
  }, []);

  function _render() {
    const gl = canvasContextRef.current!;
    const programs = programsRef.current;
    const objects = positionBuffersRef.current;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0.9);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    function _renderTriangles() {
      gl.useProgram(programs.simpleExample.program);

      gl.uniformMatrix4fv(
        programs.simpleExample.uniforms.matrix,
        false,
        flattenMatrix(
          generateMatrixFromOperations(
            {
              type: "translate",
              x: -50,
              y: -50,
              z: -50,
            },
            {
              type: "scale",
              factorX: magic.current.scale[0],
              factorY: magic.current.scale[1],
              factorZ: magic.current.scale[2],
            },
            // {
            //   type: "rotateX",
            //   angle: magic.current.rotate[0],
            // },
            // {
            //   type: "rotateY",
            //   angle: magic.current.rotate[0],
            // },
            // {
            //   type: "rotateZ",
            //   angle: magic.current.rotate[0],
            // },
            // {
            //   type: "rotateX",
            //   angle: magic.current.rotate[0],
            // },
            // {
            //   type: "rotateZ",
            //   angle: magic.current.rotate[0],
            // },,
            // Create camera translationMatrix
            {
              type: "matrix",
              matrix: invertMatrix(
                generateCameraLookTo(
                  generateMatrixFromOperations(
                    {
                      type: "translate",
                      x: 0,
                      y: 0,
                      z: 300,
                    },

                    {
                      type: "rotateY",
                      angle: magic.current.rotate[0],
                    }
                  ),
                  lookAtRef.current
                )
              ),
            },
            {
              type: "perspective",
              fieldOfViewInRadians: 120,
              aspect: gl.canvas.width / gl.canvas.height,
              far: 1000,
              near: 1,
            }
          )
        )
      );

      gl.enableVertexAttribArray(programs.simpleExample.attributes.color);
      gl.bindBuffer(gl.ARRAY_BUFFER, objects.simpleTriangle.color);
      gl.vertexAttribPointer(
        programs.simpleExample.attributes.color,
        3,
        gl.UNSIGNED_BYTE,
        true,
        0,
        0
      );

      gl.enableVertexAttribArray(programs.simpleExample.attributes.position);
      // Olha a partir deste ponto
      gl.bindBuffer(gl.ARRAY_BUFFER, objects.simpleTriangle.position);

      // A informacao ta encodada nesse formato
      gl.vertexAttribPointer(
        programs.simpleExample.attributes.position, // O programa a ser usado
        3, //Quantos valores definem um vertice
        gl.FLOAT, // Os attributos sao do tipo float 32
        false, // Nao normaliza o dado ????????
        0, // offset a cada iteracao
        0 // Comeca a partir do primeiro vertice
      );

      // Pode gerar os triangulos agora que tudo esta configurado
      gl.drawArrays(
        gl.TRIANGLES, //Triangulos??? Podemos mudar?
        0, // A partir de 0 ?
        CUBE.data.length / 3 // Pinta 3 vertices ?
      );
    }
    _renderTriangles();
  }

  return (
    <>
      <canvas
        style={{ backgroundColor: "red" }}
        ref={canvasRef}
        onClick={_render}
      />
      <ToastContainer />
    </>
  );
}

export default App;
