// an attribute will receive data from a buffer
attribute vec4 a_vertex;
uniform mat4 u_transformMatrix;
attribute vec3 a_color;
varying vec3 v_color;

// all shaders have a main function
void main() {
    gl_Position = u_transformMatrix * a_vertex;
    v_color = a_color;
}