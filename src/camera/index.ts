import { Matrix3D, multiplyMatrixes } from "../math/helpers";

type Coordinate = [number, number, number];

function crossVector(a: Coordinate, b: Coordinate) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ] as Coordinate;
}

function normalize(v: Coordinate): Coordinate {
  const variation = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  return variation > 0
    ? [v[0] / variation, v[1] / variation, v[2] / variation]
    : [0, 0, 0];
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
