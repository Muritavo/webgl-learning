import { createStaticCamera, generateCameraLookTo } from "./camera";
import {
  generateMatrixFromOperations,
  IDENTITY_MATRIX,
  invertMatrix,
  multiplyMatrixes,
} from "./math/helpers";
import { cube } from "./objects";
import { ObjectModel, setGLContext } from "./objects/helpers";
import { MOCK_BASIC_PROGRAM, MOCK_GL_CONTEXT } from "./test/helpers";

describe("Understanding what is wrong with the camera position matrix", () => {
  const pointInSpace = [[0, 0, 0, 1]]; //Point right in the center
  test("If we generate a translation matrix, it should move the vertex to correct position", () => {
    const translationMatrix = generateMatrixFromOperations({
      type: "translate",
      x: 0,
      y: 0,
      z: -100, // Go away from origin
    });

    expect(multiplyMatrixes(pointInSpace, translationMatrix)).toEqual([
      [0, 0, -100, 1],
    ]);
  });
  test("Let's say the camera is away from the point", () => {
    const translationMatrix = generateMatrixFromOperations({
      type: "translate",
      x: 0,
      y: 0,
      z: -100, // Go away from origin
    });

    const cameraMatrix = generateMatrixFromOperations({
      type: "translate",
      x: 0,
      y: 0,
      z: 100,
    });

    const invertedMatrix = invertMatrix(cameraMatrix);
    const pointMatrix = multiplyMatrixes(translationMatrix, invertedMatrix);

    expect(multiplyMatrixes(pointInSpace, pointMatrix)).toEqual([
      [0, 0, -200, 1],
    ]);
  });

  test("Let's say the camera rotated 90deg and is away from the point", () => {
    const translationMatrix = generateMatrixFromOperations({
      type: "translate",
      x: 0,
      y: 0,
      z: -100, // Go -away from origin
    });

    const cameraMatrix = generateMatrixFromOperations(
      {
        type: "translate",
        x: 0,
        y: 0,
        z: 100, // Go away from the origin
      },
      {
        type: "rotateY",
        angle: 90, // Rotate in relation to the origin
      }
    );

    const invertedMatrix = invertMatrix(cameraMatrix);
    const pointMatrix = multiplyMatrixes(translationMatrix, invertedMatrix);

    expect(multiplyMatrixes([[0, 0, 0, 1]], pointMatrix)).toEqual([
      [100, 0, -100, 1],
    ]);
  });
});

test("Should rotate the vertex correctly", () => {
  const rotatationMatrix = generateMatrixFromOperations({
    type: "rotateY",
    angle: 90,
  });

  expect(multiplyMatrixes([[0, 0, 0, 1]], rotatationMatrix)).toEqual([
    [0, 0, 0, 1],
  ]);
  expect(multiplyMatrixes([[0, 0, 1, 1]], rotatationMatrix)).toEqual([
    [1, 0, 6.123233995736766e-17, 1],
  ]);
});

it("Should posiiton correctly on the new struture", () => {
  setGLContext(MOCK_GL_CONTEXT());
  const CUBE = cube(-0.1);

  const firstVertex = CUBE.data.slice(0, 3);
  const secondVertex = CUBE.data.slice(3, 6);
  expect(firstVertex).toEqual([0, 0, 0]);
  expect(secondVertex).toEqual([0, -0.1, 0]);

  const obj = new ObjectModel(MOCK_BASIC_PROGRAM());
  obj.load("a_vertex", new Float32Array(CUBE.data));
  obj.setCamera(createStaticCamera([0, 0, 300], [0, 0, 0]));

  expect(obj._transformationMatrix).toEqual(IDENTITY_MATRIX());

  expect(
    multiplyMatrixes([[...firstVertex, 1]], obj._transformationMatrix)
  ).toEqual([[0, 0, 0, 1]]);

  expect(
    multiplyMatrixes([[...secondVertex, 1]], obj._transformationMatrix)
  ).toEqual([[0, -0.1, 0, 1]]);
});
