/** eslint-disable import/no-webpack-loader-syntax */

import { createProgram } from "../helpers";
import vert from "./.vert";
import frag from "./.frag";
import { Program } from "../../objects/helpers";

export default new (class MonoColor extends Program<
  "a_color",
  ""
> {
  loadShaders() {
    this._createProgram(vert, frag);
    this.attributes.a_color = this._glContext.getAttribLocation(this.program, "a_color");
  }
})();
