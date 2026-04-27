let g_cylinderBuffer = null;
let g_cylinderVertexCount = 0;

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

    vertices.push(x1, -0.5, z1);
    vertices.push(x2, -0.5, z2);
    vertices.push(x2,  0.5, z2);

    vertices.push(x1, -0.5, z1);
    vertices.push(x2,  0.5, z2);
    vertices.push(x1,  0.5, z1);

    vertices.push(0, 0.5, 0);
    vertices.push(x2, 0.5, z2);
    vertices.push(x1, 0.5, z1);

    vertices.push(0, -0.5, 0);
    vertices.push(x1, -0.5, z1);
    vertices.push(x2, -0.5, z2);
  }

  g_cylinderVertexCount = vertices.length / 3;

  g_cylinderBuffer = gl.createBuffer();

  if (!g_cylinderBuffer) {
    console.log("Failed to create cylinder buffer");
    return;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, g_cylinderBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}

function drawCylinder(matrix, color) {
  gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
  gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);

  gl.bindBuffer(gl.ARRAY_BUFFER, g_cylinderBuffer);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, g_cylinderVertexCount);
}