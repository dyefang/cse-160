let g_cylinderBuffer = null;
let g_cylinderVertexCount = 0;
const CYL_FLOATS_PER_VERTEX = 8;

function pushCylinderVertex(arr, x, y, z, u, v, nx, ny, nz) {
  arr.push(x, y, z, u, v, nx, ny, nz);
}

function initCylinderBuffer() {
  let vertices = [];
  let segments = 24;

  for (let i = 0; i < segments; i++) {
    let angle1 = (i / segments) * 2 * Math.PI;
    let angle2 = ((i + 1) / segments) * 2 * Math.PI;

    let x1 = Math.cos(angle1) * 0.5;
    let z1 = Math.sin(angle1) * 0.5;
    let x2 = Math.cos(angle2) * 0.5;
    let z2 = Math.sin(angle2) * 0.5;

    let nx1 = Math.cos(angle1), nz1 = Math.sin(angle1);
    let nx2 = Math.cos(angle2), nz2 = Math.sin(angle2);

    // side
    pushCylinderVertex(vertices, x1, -0.5, z1, i/segments, 0, nx1, 0, nz1);
    pushCylinderVertex(vertices, x2, -0.5, z2, (i+1)/segments, 0, nx2, 0, nz2);
    pushCylinderVertex(vertices, x2,  0.5, z2, (i+1)/segments, 1, nx2, 0, nz2);

    pushCylinderVertex(vertices, x1, -0.5, z1, i/segments, 0, nx1, 0, nz1);
    pushCylinderVertex(vertices, x2,  0.5, z2, (i+1)/segments, 1, nx2, 0, nz2);
    pushCylinderVertex(vertices, x1,  0.5, z1, i/segments, 1, nx1, 0, nz1);

    // top cap
    pushCylinderVertex(vertices, 0, 0.5, 0, 0.5, 0.5, 0, 1, 0);
    pushCylinderVertex(vertices, x2, 0.5, z2, 0.5 + x2, 0.5 + z2, 0, 1, 0);
    pushCylinderVertex(vertices, x1, 0.5, z1, 0.5 + x1, 0.5 + z1, 0, 1, 0);

    // bottom cap
    pushCylinderVertex(vertices, 0, -0.5, 0, 0.5, 0.5, 0, -1, 0);
    pushCylinderVertex(vertices, x1, -0.5, z1, 0.5 + x1, 0.5 + z1, 0, -1, 0);
    pushCylinderVertex(vertices, x2, -0.5, z2, 0.5 + x2, 0.5 + z2, 0, -1, 0);
  }

  g_cylinderVertexCount = vertices.length / CYL_FLOATS_PER_VERTEX;
  g_cylinderBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, g_cylinderBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}

function drawCylinder(matrix, color) {
  gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
  gl.uniform1i(u_WhichTexture, -1);
  gl.uniform1f(u_TexColorWeight, 0.0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);

  let normalMatrix = new Matrix4();
  normalMatrix.setInverseOf(matrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

  gl.bindBuffer(gl.ARRAY_BUFFER, g_cylinderBuffer);

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, CYL_FLOATS_PER_VERTEX * 4, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, CYL_FLOATS_PER_VERTEX * 4, 3 * 4);
  gl.enableVertexAttribArray(a_UV);

  gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, CYL_FLOATS_PER_VERTEX * 4, 5 * 4);
  gl.enableVertexAttribArray(a_Normal);

  gl.drawArrays(gl.TRIANGLES, 0, g_cylinderVertexCount);
}
