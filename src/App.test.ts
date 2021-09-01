import { generateCameraLookTo } from "./camera";
import {
  generateMatrixFromOperations,
  invertMatrix,
  multiplyMatrixes,
} from "./math/helpers";

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
