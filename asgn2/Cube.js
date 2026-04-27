let g_cubeBuffer = null;

const g_cubeVertices = new Float32Array([
  -0.5, -0.5, -0.5,
   0.5, -0.5, -0.5,
   0.5,  0.5, -0.5,
  -0.5, -0.5, -0.5,
   0.5,  0.5, -0.5,
  -0.5,  0.5, -0.5,

  -0.5, -0.5, 0.5,
   0.5, -0.5, 0.5,
   0.5,  0.5, 0.5,
  -0.5, -0.5, 0.5,
   0.5,  0.5, 0.5,
  -0.5,  0.5, 0.5,

  -0.5, 0.5, -0.5,
   0.5, 0.5, -0.5,
   0.5, 0.5,  0.5,
  -0.5, 0.5, -0.5,
   0.5, 0.5,  0.5,
  -0.5, 0.5,  0.5,

  -0.5, -0.5, -0.5,
   0.5, -0.5, -0.5,
   0.5, -0.5,  0.5,
  -0.5, -0.5, -0.5,
   0.5, -0.5,  0.5,
  -0.5, -0.5,  0.5,

   0.5, -0.5, -0.5,
   0.5,  0.5, -0.5,
   0.5,  0.5,  0.5,
   0.5, -0.5, -0.5,
   0.5,  0.5,  0.5,
   0.5, -0.5,  0.5,

  -0.5, -0.5, -0.5,
  -0.5,  0.5, -0.5,
  -0.5,  0.5,  0.5,
  -0.5, -0.5, -0.5,
  -0.5,  0.5,  0.5,
  -0.5, -0.5,  0.5
]);

function initCubeBuffer() {
  g_cubeBuffer = gl.createBuffer();

  if (!g_cubeBuffer) {
    console.log("Failed to create cube buffer");
    return;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, g_cubeVertices, gl.STATIC_DRAW);
}

function drawCube(matrix, color) {
  gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
  gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);

  gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeBuffer);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, 36);
}