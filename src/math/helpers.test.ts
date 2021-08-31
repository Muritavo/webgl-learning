import {
  generateMatrixFromOperations,
  Matrix3D,
  multiplyMatrixes,
  OperationData,
  rotate,
} from "./helpers";

it.each([
  [
    {
      rotateX: 0,
      rotateY: 0,
    },
    {
      x: 0,
      y: 1,
    },
  ],
  [
    {
      rotateX: 30,
      rotateY: 30,
    },
    {
      x: 0.49,
      y: 0.87,
    },
  ],
])(
  "Should give expected result when asking to rotate in angles",
  (angle, expectation) => {
    expect(rotate(angle.rotateX).x).toBeCloseTo(expectation.x, 1);
    expect(rotate(angle.rotateX).y).toBeCloseTo(expectation.y, 1);
  }
);

it.each([
  [
    [
      {
        type: "translate",
        x: 10,
        y: 20,
        z: 0,
      },
    ],
    [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [10, 20, 0, 1],
    ],
  ],
  [
    [
      {
        type: "rotateZ",
        angle: 30,
      },
    ],
    [
      [0.8660254037844387, 0.49999999999999994, 0, 0],
      [-0.49999999999999994, 0.8660254037844387, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ],
  ],
  [
    [
      {
        type: "scale",
        factorX: 2,
        factorY: 3,
        factorZ: 1,
      },
    ],
    [
      [2, 0, 0, 0],
      [0, 3, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ],
  ],
] as [OperationData[], Matrix3D][])(
  "Should modify matrix correctly",
  (operations, expectation) => {
    const resultingMatrix = generateMatrixFromOperations(...operations);

    expect(resultingMatrix).toEqual(expectation);
  }
);

it("Should multiply matrixes correctly", () => {
  expect(
    multiplyMatrixes(
      [
        [1, 2, 3, 0],
        [4, 5, 6, 0],
        [7, 8, 9, 0],
        [7, 8, 9, 0],
      ],
      [
        [1, 2, 1, 0],
        [2, 4, 6, 0],
        [7, 2, 5, 0],
        [7, 2, 5, 0],
      ]
    )
  ).toEqual([
    [26, 16, 28, 0],
    [56, 40, 64, 0],
    [86, 64, 100, 0],
    [86, 64, 100, 0],
  ]);
});
it("Should be the same as mulitplication", () => {
  expect(
    generateMatrixFromOperations(
      {
        type: "scale",
        factorX: 2,
        factorY: -2,
        factorZ: 1,
      },
      {
        type: "translate",
        x: -1,
        y: 1,
        z: 0,
      }
    )
  ).toEqual([
    [2, 0, 0, 0],
    [0, -2, 0, 0],
    [0, 0, 1, 0],
    [-1, 1, 0, 1],
  ]);
});

it("Should multiply different dimensions matrixes", () => {
  //prettier-ignore
  expect(multiplyMatrixes([
    [1, 2, 3, 4]
  ] as const, [
    [1], 
    [1], 
    [1], 
    [1]
  ] as const)).toEqual([[10]]);
});
