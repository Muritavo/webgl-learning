import { Program } from "../objects/helpers";

export function MOCK_GL_CONTEXT() {
  return {
    clearColor: jest.fn(),
    clear: jest.fn(),
    createBuffer: jest.fn(),
    useProgram: jest.fn(),
    bindBuffer: jest.fn(),
    bufferData: jest.fn(),
    enableVertexAttribArray: jest.fn(),
    vertexAttribPointer: jest.fn(),
    enable: jest.fn(),
    viewport: jest.fn(),
    uniformMatrix4fv: jest.fn(),
    canvas: {
      width: 1920,
      height: 1080,
    },
  } as any;
}

export function MOCK_BASIC_PROGRAM() {
  return {
    program: 0,
    attributes: { a_vertex: 0 },
    uniforms: { u_transformMatrix: 1 },
  } as unknown as Program<"a_var", "">;
}
