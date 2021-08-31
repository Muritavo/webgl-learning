export function rotate(angleX: number) {
  const angleXToRadians = (angleX * Math.PI) / 180;
  const angleYToRadians = (angleX * Math.PI) / 180;
  return {
    x: Math.sin(angleXToRadians),
    y: Math.cos(angleYToRadians),
  };
}

export type Matrix3D = [
  [number, number, number, number],
  [number, number, number, number],
  [number, number, number, number],
  [number, number, number, number]
];
export type OperationData =
  | {
      type: "rotateX" | "rotateY" | "rotateZ";
      angle: number;
    }
  | {
      type: "translate";
      x: number;
      y: number;
      z: number;
    }
  | {
      type: "scale";
      factorX: number;
      factorY: number;
      factorZ: number;
    };

// prettier-ignore
function IDENTITY_MATRIX() {
  return [
    [1, 0, 0, 0],  // cos, -sin, ?
    [0, 1, 0, 0],  // sin, cos, ?
    [0, 0, 1, 0],   // TranslationX, TranslationY, ?
    [0, 0, 0, 1]
  ] as Matrix3D;
 }
export function generateMatrixFromOperations(
  ...operations: OperationData[]
): Matrix3D {
  let resultingMatrix: Matrix3D | undefined = undefined;
  for (let operation of operations) {
    const matrix = IDENTITY_MATRIX();
    switch (operation.type) {
      case "translate":
        matrix[3][0] = operation.x;
        matrix[3][1] = operation.y;
        matrix[3][2] = operation.z;
        break;
      case "rotateX":
      case "rotateY":
      case "rotateZ":
        const angleToRadians = (operation.angle * Math.PI) / 180;
        const sinAngle = Math.sin(angleToRadians);
        const cosAngle = Math.cos(angleToRadians);
        switch (operation.type) {
          case "rotateZ":
            matrix[0][0] = cosAngle;
            matrix[1][1] = cosAngle;
            matrix[1][0] = -sinAngle;
            matrix[0][1] = sinAngle;
            break;
          case "rotateY":
            matrix[0][0] = cosAngle;
            matrix[2][2] = cosAngle;
            matrix[0][2] = -sinAngle;
            matrix[2][0] = sinAngle;
            break;
          case "rotateX":
            matrix[1][1] = cosAngle;
            matrix[2][2] = cosAngle;
            matrix[2][1] = -sinAngle;
            matrix[1][2] = sinAngle;
            break;
        }
        break;
      case "scale":
        matrix[0][0] = operation.factorX;
        matrix[1][1] = operation.factorY;
        matrix[2][2] = operation.factorZ;
        break;
    }
    if (resultingMatrix) {
      resultingMatrix = multiplyMatrixes(resultingMatrix, matrix) as Matrix3D;
    } else {
      resultingMatrix = matrix;
    }
  }

  return resultingMatrix || IDENTITY_MATRIX();
}

// 00 * 00 - 01 * 10 - 02 * 20
// 00 * 10 - 01 * 11 - 02 * 12

// 1 row * 1 column = 1x1
// 1 row * 2 column = 1x2
// 1 row * 3 column = 1x3

type NumberMatrix = readonly (readonly number[])[];
export function multiplyMatrixes<X extends NumberMatrix>(
  matrix1: X,
  matrix2: NumberMatrix & { length: X[number]["length"] }
) {
  const resultingMatrix: number[][] = [];
  if (process.env.NODE_ENV === "development" && matrix2.length !== matrix1[0].length) {
    throw new Error(`For the multiplication of matrixes to work you need to provide the matrix1 containing the amount of columns as the same amount of rows from matrix 2.
You provided ${matrix1[0].length} columns and ${matrix2.length} rows`);
  }
  for (let i0 in matrix1) {
    for (let i in matrix2[0]) {
      let dimensionResult = 0;
      for (let i2 in matrix1[0]) {
        dimensionResult += matrix1[i0][i2] * matrix2[i2][i];
      }
      if (!resultingMatrix[i0]) resultingMatrix[i0] = [];
      resultingMatrix[i0][i] = dimensionResult;
    }
  }
  return resultingMatrix;
}

export function flattenMatrix(matrix: number[][]) {
  return matrix.reduce((f, dimension) => [...f, ...dimension], [] as number[]);
}
