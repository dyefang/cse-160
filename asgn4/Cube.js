let g_cubeBuffer = null;
const FLOATS_PER_VERTEX = 8;

// 36 vertices. Each vertex = x,y,z,u,v,nx,ny,nz
const g_cubeVertices = new Float32Array([
  // front +Z
  -0.5,-0.5, 0.5, 0,0, 0,0,1,   0.5,-0.5, 0.5, 1,0, 0,0,1,   0.5, 0.5, 0.5, 1,1, 0,0,1,
  -0.5,-0.5, 0.5, 0,0, 0,0,1,   0.5, 0.5, 0.5, 1,1, 0,0,1,  -0.5, 0.5, 0.5, 0,1, 0,0,1,

  // back -Z
   0.5,-0.5,-0.5, 0,0, 0,0,-1,  -0.5,-0.5,-0.5, 1,0, 0,0,-1,  -0.5, 0.5,-0.5, 1,1, 0,0,-1,
   0.5,-0.5,-0.5, 0,0, 0,0,-1,  -0.5, 0.5,-0.5, 1,1, 0,0,-1,   0.5, 0.5,-0.5, 0,1, 0,0,-1,

  // top +Y
  -0.5, 0.5, 0.5, 0,0, 0,1,0,   0.5, 0.5, 0.5, 1,0, 0,1,0,   0.5, 0.5,-0.5, 1,1, 0,1,0,
  -0.5, 0.5, 0.5, 0,0, 0,1,0,   0.5, 0.5,-0.5, 1,1, 0,1,0,  -0.5, 0.5,-0.5, 0,1, 0,1,0,

  // bottom -Y
  -0.5,-0.5,-0.5, 0,0, 0,-1,0,   0.5,-0.5,-0.5, 1,0, 0,-1,0,   0.5,-0.5, 0.5, 1,1, 0,-1,0,
  -0.5,-0.5,-0.5, 0,0, 0,-1,0,   0.5,-0.5, 0.5, 1,1, 0,-1,0,  -0.5,-0.5, 0.5, 0,1, 0,-1,0,

  // right +X
   0.5,-0.5, 0.5, 0,0, 1,0,0,   0.5,-0.5,-0.5, 1,0, 1,0,0,   0.5, 0.5,-0.5, 1,1, 1,0,0,
   0.5,-0.5, 0.5, 0,0, 1,0,0,   0.5, 0.5,-0.5, 1,1, 1,0,0,   0.5, 0.5, 0.5, 0,1, 1,0,0,

  // left -X
  -0.5,-0.5,-0.5, 0,0, -1,0,0,  -0.5,-0.5, 0.5, 1,0, -1,0,0,  -0.5, 0.5, 0.5, 1,1, -1,0,0,
  -0.5,-0.5,-0.5, 0,0, -1,0,0,  -0.5, 0.5, 0.5, 1,1, -1,0,0,  -0.5, 0.5,-0.5, 0,1, -1,0,0
]);

function initCubeBuffer() {
  g_cubeBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, g_cubeVertices, gl.STATIC_DRAW);
}

function drawCube(matrix, color, textureNum, texWeight) {
  if (textureNum === undefined) textureNum = -1;
  if (texWeight === undefined) texWeight = 0.0;

  gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
  gl.uniform1i(u_WhichTexture, textureNum);
  gl.uniform1f(u_TexColorWeight, texWeight);
  gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);

  let normalMatrix = new Matrix4();
  normalMatrix.setInverseOf(matrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

  gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeBuffer);

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FLOATS_PER_VERTEX * 4, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, FLOATS_PER_VERTEX * 4, 3 * 4);
  gl.enableVertexAttribArray(a_UV);

  gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, FLOATS_PER_VERTEX * 4, 5 * 4);
  gl.enableVertexAttribArray(a_Normal);

  gl.drawArrays(gl.TRIANGLES, 0, 36);
}
