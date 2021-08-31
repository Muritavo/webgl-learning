// an attribute will receive data from a buffer
attribute vec4 a_position;
uniform mat4 u_matrix;
attribute vec3 a_color;
varying vec3 v_color;

// all shaders have a main function
void main() {
    gl_Position = u_matrix * a_position;
    v_color = a_color;
}