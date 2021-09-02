import { MOCK_BASIC_PROGRAM, MOCK_GL_CONTEXT } from "../test/helpers";
import { ObjectModel, setGLContext } from "./helpers";

it("Should create center matrix correctly", () => {
  setGLContext(MOCK_GL_CONTEXT());
  const obj = new ObjectModel(MOCK_BASIC_PROGRAM());
  //prettier-ignore
  obj.load("a_vertex", new Float32Array([
        0,0,0,
        0,100,0,
        200,0,0,
        0,0,300,
    ]));

  expect(obj._centerTranslationMatrix).toEqual([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [-100, -50, -150, 1],
  ]);
});
