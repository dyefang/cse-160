let g_sphereBuffer = null;
let g_sphereVertexCount = 0;
const SPHERE_FLOATS_PER_VERTEX = 8;

function pushSphereVertex(arr, x, y, z, u, v) {
  // For a unit sphere centered at origin, normal equals position direction.
  let len = Math.sqrt(x*x + y*y + z*z);
  let nx = x / len, ny = y / len, nz = z / len;
  arr.push(x, y, z, u, v, nx, ny, nz);
}

function initSphereBuffer() {
  let vertices = [];
  let latBands = 24;
  let lonBands = 24;

  for (let lat = 0; lat < latBands; lat++) {
    let theta1 = lat * Math.PI / latBands;
    let theta2 = (lat + 1) * Math.PI / latBands;

    for (let lon = 0; lon < lonBands; lon++) {
      let phi1 = lon * 2 * Math.PI / lonBands;
      let phi2 = (lon + 1) * 2 * Math.PI / lonBands;

      let p1 = spherePoint(theta1, phi1);
      let p2 = spherePoint(theta2, phi1);
      let p3 = spherePoint(theta2, phi2);
      let p4 = spherePoint(theta1, phi2);

      let u1 = lon / lonBands, u2 = (lon + 1) / lonBands;
      let v1 = lat / latBands, v2 = (lat + 1) / latBands;

      pushSphereVertex(vertices, p1[0], p1[1], p1[2], u1, v1);
      pushSphereVertex(vertices, p2[0], p2[1], p2[2], u1, v2);
      pushSphereVertex(vertices, p3[0], p3[1], p3[2], u2, v2);

      pushSphereVertex(vertices, p1[0], p1[1], p1[2], u1, v1);
      pushSphereVertex(vertices, p3[0], p3[1], p3[2], u2, v2);
      pushSphereVertex(vertices, p4[0], p4[1], p4[2], u2, v1);
    }
  }

  g_sphereVertexCount = vertices.length / SPHERE_FLOATS_PER_VERTEX;
  g_sphereBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, g_sphereBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}

function spherePoint(theta, phi) {
  return [
    Math.sin(theta) * Math.cos(phi) * 0.5,
    Math.cos(theta) * 0.5,
    Math.sin(theta) * Math.sin(phi) * 0.5
  ];
}

function drawSphere(matrix, color, textureNum, texWeight) {
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

  gl.bindBuffer(gl.ARRAY_BUFFER, g_sphereBuffer);

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, SPHERE_FLOATS_PER_VERTEX * 4, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, SPHERE_FLOATS_PER_VERTEX * 4, 3 * 4);
  gl.enableVertexAttribArray(a_UV);

  gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, SPHERE_FLOATS_PER_VERTEX * 4, 5 * 4);
  gl.enableVertexAttribArray(a_Normal);

  gl.drawArrays(gl.TRIANGLES, 0, g_sphereVertexCount);
}
