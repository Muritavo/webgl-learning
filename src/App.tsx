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
  rotate,
} from "./math/helpers";
import { cube } from "./objects/square";

type Programs = {
  simpleExample: ReturnType<typeof initSimpleShader>;
};
type AvailableObjects = "simpleTriangle";
type Objects = {
  [key in AvailableObjects]: WebGLBuffer;
};

const CUBE = cube(40);

console.warn(
  CUBE.reduce((r, i, index) => {
    const arr = r[Math.floor(index / 3)];
    if (!arr) r[Math.floor(index / 3)] = [i];
    else arr.push(i);
    return r;
  }, [] as number[][])
    .map((i) => i.join(","))
    .join("\n")
);

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContextRef = useRef<WebGLRenderingContext>();
  const programsRef = useRef<Programs>({} as any);
  const positionBuffersRef = useRef<Objects>({} as any);
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
      glContext.bindBuffer(glContext.ARRAY_BUFFER, positionBuffer);
      glContext.bufferData(
        glContext.ARRAY_BUFFER,
        new Float32Array(CUBE),
        glContext.STATIC_DRAW
      );
      positionBuffersRef.current.simpleTriangle = positionBuffer;
    }

    _loadTriangleVertices();
    _render();
    // alert(glContext.geterror());
  });

  const magic = useRef({
    transform: [0, 0, 0],
    rotate: [0],
    scale: [5, 5, 1],
  });
  useEffect(() => {
    window.onclick = () =>
      setInterval(() => {
        const error = canvasContextRef.current!.getError();
        if (error !== canvasContextRef.current!.NO_ERROR)
          toast(
            "Hey dumbass, something has gone wrong with webgl. Check the logs. Code: " +
              error
          );
        else {
          if (magic.current.rotate[0] < 360) {
            magic.current.rotate[0] += 0.5;
          } else {
            magic.current.rotate[0] = 0.5;
            if (Math.random() < 0.5) {
              magic.current.scale[0] += 0.1;
            } else {
              magic.current.scale[1] += 0.1;
            }
          }

          _render();
        }
      }, 1000 / 60);
  });

  function _render() {
    const gl = canvasContextRef.current!;
    const programs = programsRef.current;
    const objects = positionBuffersRef.current;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0.9);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);

    function _renderTriangles() {
      gl.useProgram(programs.simpleExample.program);
      gl.enableVertexAttribArray(programs.simpleExample.attributes.position);

      gl.uniformMatrix4fv(
        programs.simpleExample.uniforms.matrix,
        false,
        flattenMatrix(
          generateMatrixFromOperations(
            {
              type: "translate",
              x: -20,
              y: -20,
              z: 0,
            },
            {
              type: "rotateY",
              angle: magic.current.rotate[0],
            },
            // {
            //   type: "rotateX",
            //   angle: magic.current.rotate[0],
            // },
            // {
            //   type: "rotateZ",
            //   angle: magic.current.rotate[0],
            // },
            {
              type: "translate",
              x: 200,
              y: 200,
              z: 0,
            },
            {
              type: "scale",
              factorX: 2 / gl.canvas.width,
              factorY: -2 / gl.canvas.height,
              factorZ: 2 / gl.canvas.width,
            },
            {
              type: "translate",
              x: -1,
              y: 1,
              z: 0,
            }
          )
        )
      );

      // Olha a partir deste ponto
      gl.bindBuffer(gl.ARRAY_BUFFER, objects.simpleTriangle);

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
        6 * 2 // Pinta 3 vertices ?
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
