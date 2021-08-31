import {
  flattenMatrix,
  generateMatrixFromOperations,
  multiplyMatrixes,
} from "../../math/helpers";

type POSITION = [number, number, number];

export function cube(size: number) {
  // prettier-ignore
  const frontFace1 = [
      [0, 0, 0], 
      [0, size, 0],
      [size, 0, 0], 
    ];
  const frontFace2 = [...frontFace1.slice(1).reverse(), [size, size, 0]];
  const frontFace = [...frontFace1, ...frontFace2];
  const backFace = multiplyMatrixes(
    frontFace.map((a) => [...a, 1]),
    generateMatrixFromOperations(
      {
        type: "translate",
        x: -size / 2,
        y: -size / 2,
        z: 0,
      },
      {
        type: "rotateX",
        angle: 180,
      },
      {
        type: "translate",
        x: size / 2,
        y: size / 2,
        z: -size,
      }
    )
  ).map((a) => a.slice(0, 3));
  const rightFace = multiplyMatrixes(
    frontFace.map((a) => [...a, 1]),
    generateMatrixFromOperations(
      {
        type: "translate",
        x: -size / 2,
        y: -size / 2,
        z: 0,
      },
      {
        type: "rotateY",
        angle: 90,
      },
      {
        type: "translate",
        x: size,
        y: size / 2,
        z: -size / 2,
      }
    )
  ).map((a) => a.slice(0, 3));
  const leftFace = multiplyMatrixes(
    frontFace.map((a) => [...a, 1]),
    generateMatrixFromOperations(
      {
        type: "translate",
        x: -size / 2,
        y: -size / 2,
        z: 0,
      },
      {
        type: "rotateY",
        angle: -90,
      },
      {
        type: "translate",
        x: -size,
        y: size / 2,
        z: -size / 2,
      }
    )
  ).map((a) => a.slice(0, 3));

  return flattenMatrix([...frontFace, ...rightFace, ...backFace]);
}
