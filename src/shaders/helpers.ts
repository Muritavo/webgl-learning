type SUPPORTED_TYPES =
  | WebGLRenderingContext["VERTEX_SHADER"]
  | WebGLRenderingContext["FRAGMENT_SHADER"];

function createShader(
  gl: WebGLRenderingContext,
  type: SUPPORTED_TYPES,
  source: string
) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function _createProgram(
  gl: WebGLRenderingContext,
  vertexShader: string,
  fragmentShader: string
) {
  const _vertexShader: WebGLShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShader
  )!;
  const _fragmentShader: WebGLShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShader
  )!;
  const program = gl.createProgram()!;
  gl.attachShader(program, _vertexShader);
  gl.attachShader(program, _fragmentShader);
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

export function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: string,
  fragmentShader: string
) {
  const program = _createProgram(gl, vertexShader, fragmentShader)!;

  //Variables for this shader
  const position = gl.getAttribLocation(program, "a_position");
  const matrix = gl.getUniformLocation(program, "u_matrix");

  return {
    attributes: {
      position,
    },
    uniforms: {
      matrix,
    },
    program,
  };
}
