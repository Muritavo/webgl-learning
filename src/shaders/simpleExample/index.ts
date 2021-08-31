/** eslint-disable import/no-webpack-loader-syntax */

import { createProgram } from "../helpers";
import vert from "./.vert";
import frag from "./.frag";

export default function initShader(gl: WebGLRenderingContext) {
  return createProgram(gl, vert, frag);
}
