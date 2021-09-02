import {
  generateMatrixFromOperations,
  invertMatrix,
  Matrix3D,
  normalize,
} from "../math/helpers";
import { getGLContext } from "../objects/helpers";

type Coordinate = [number, number, number];

function crossVector(a: Coordinate, b: Coordinate) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ] as Coordinate;
}

export function generateCameraLookTo(
  cameraMatrix: Matrix3D,
  whereItShouldLookTo: Coordinate
) {
  const whereIsTheCameraAt: Coordinate = [
    cameraMatrix[3][0],
    cameraMatrix[3][1],
    cameraMatrix[3][2],
  ];
  const vectorCoordinate = normalize(
    whereIsTheCameraAt.map((a, i) => a - whereItShouldLookTo[i]) as Coordinate
  );
  const xAxisCoordinate = normalize(crossVector([0, 1, 0], vectorCoordinate));
  const yAxisCoordinate = normalize(
    crossVector(vectorCoordinate, xAxisCoordinate)
  );
  const lookAtMatrix = [
    [...xAxisCoordinate, 0],
    [...yAxisCoordinate, 0],
    [...vectorCoordinate, 0],
    [...whereIsTheCameraAt, 1],
  ] as Matrix3D;

  return lookAtMatrix as Matrix3D;
}

export function createStaticCamera(
  whereIsTheCameraAt: Coordinate,
  whereItShouldLookTo: Coordinate
) {
  const gl = getGLContext();
  return generateMatrixFromOperations(
    {
      type: "matrix",
      matrix: invertMatrix(
        generateCameraLookTo(
          generateMatrixFromOperations({
            type: "translate",
            x: whereIsTheCameraAt[0],
            y: whereIsTheCameraAt[1],
            z: whereIsTheCameraAt[2],
          }),
          whereItShouldLookTo
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
  );
}
