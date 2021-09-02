import React from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { resizeCanvasToDisplaySize } from "./helpers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { cube } from "./objects";
import { createStaticCamera, generateCameraLookTo } from "./camera";
import { getGLContext, ObjectModel, setGLContext } from "./objects/helpers";
import vertexColor from "./shaders/vertexColor";

const CUBE = cube(100);
const CUBE2 = cube(50);

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContextRef = useRef<WebGLRenderingContext>();
  const lookAtRef = useRef<[number, number, number]>([50, 0, 0]);
  const cubeInstanceRef = useRef<ObjectModel<typeof vertexColor>>(null as any);
  const cube2InstanceRef = useRef<ObjectModel<typeof vertexColor>>(null as any);

  useEffect(() => {
    resizeCanvasToDisplaySize(canvasRef.current!);
    const glContext = canvasRef.current!.getContext("webgl")!;
    setGLContext(glContext);
    canvasContextRef.current = glContext!;
    const monoColorProgram = require("./shaders/monoColor").default;

    function _loadCubeData() {
      cubeInstanceRef.current = new ObjectModel(monoColorProgram);
      cubeInstanceRef.current.load("a_vertex", new Float32Array(CUBE.data));
      cubeInstanceRef.current.load(
        "a_color",
        new Uint8Array(CUBE.color),
        3,
        true
      );
      cubeInstanceRef.current.setCamera(
        createStaticCamera([50, 60, 300], lookAtRef.current!)
      );

      cube2InstanceRef.current = new ObjectModel(monoColorProgram);
      cube2InstanceRef.current.load("a_vertex", new Float32Array(CUBE2.data));
      cube2InstanceRef.current.load(
        "a_color",
        new Uint8Array(CUBE2.color),
        3,
        true
      );
      cube2InstanceRef.current.setCamera(
        createStaticCamera([50, 60, 300], lookAtRef.current!)
      );
      cube2InstanceRef.current.set("position", [75 + 20, 0, 0]);
    }

    _loadCubeData();
    _render();
    // alert(glContext.geterror());
  });

  function _render() {
    const gl = getGLContext();
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    cubeInstanceRef.current.draw();
    cube2InstanceRef.current.draw();
  }

  const magic = useRef({
    transform: [0, 0, 0],
    rotate: [0],
    scale: [1, 1, 1],
  });
  useEffect(() => {
    window.addEventListener("keydown", ({ key, shiftKey, altKey }) => {
      const multiplier = shiftKey ? 10 : 1;
      const whichArrayToChange = altKey
        ? cubeInstanceRef.current._position
        : lookAtRef.current;
      if (key === "ArrowUp") whichArrayToChange[1] += 1 * multiplier;
      if (key === "ArrowDown") whichArrayToChange[1] -= 1 * multiplier;
      if (key === "ArrowRight") whichArrayToChange[0] += 1 * multiplier;
      if (key === "ArrowLeft") whichArrayToChange[0] -= 1 * multiplier;
      if (altKey) {
        cubeInstanceRef.current.set("position", whichArrayToChange);
      }
      cubeInstanceRef.current.setCamera(
        createStaticCamera([50, 60, 300], lookAtRef.current!)
      );
      cube2InstanceRef.current.setCamera(
        createStaticCamera([50, 60, 300], lookAtRef.current!)
      );
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
            magic.current.rotate[0] += 10 * deltaTime;
          } else {
            magic.current.rotate[0] = 10 * deltaTime;
            if (Math.random() < 0.5) {
              magic.current.scale[0] += 0.1;
            } else {
              magic.current.scale[1] += 0.1;
            }
          }

          _render();

          cubeInstanceRef.current.set("rotation", [
            magic.current.rotate[0] * 3,
            magic.current.rotate[0],
            magic.current.rotate[0] * 2,
          ]);

          cube2InstanceRef.current.set(
            "rotation",
            [
              magic.current.rotate[0] * 3,
              magic.current.rotate[0],
              magic.current.rotate[0] * 2,
            ].map((a) => -1 * a) as Coordinate
          );
        }
      });
    }, 1000 / 120);
  }, []);

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
