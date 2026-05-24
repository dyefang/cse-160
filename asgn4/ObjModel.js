let g_objModel = null;

class ObjModel {
  constructor(objText) {
    this.buffer = null;
    this.vertexCount = 0;
    this.vertices = this.parseOBJ(objText);
    this.initBuffer();
  }

  parseOBJ(text) {
    let positions = [[0,0,0]];
    let normals = [[0,1,0]];
    let texcoords = [[0,0]];
    let out = [];

    let lines = text.split("\n");
    for (let line of lines) {
      line = line.trim();
      if (line === "" || line.startsWith("#")) continue;

      let parts = line.split(/\s+/);
      if (parts[0] === "v") {
        positions.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
      } else if (parts[0] === "vn") {
        normals.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
      } else if (parts[0] === "vt") {
        texcoords.push([parseFloat(parts[1]), parseFloat(parts[2])]);
      } else if (parts[0] === "f") {
        // Triangulate fan: f a b c d -> abc, acd
        for (let i = 2; i < parts.length - 1; i++) {
          this.pushOBJVertex(out, parts[1], positions, texcoords, normals);
          this.pushOBJVertex(out, parts[i], positions, texcoords, normals);
          this.pushOBJVertex(out, parts[i + 1], positions, texcoords, normals);
        }
      }
    }

    return new Float32Array(out);
  }

  pushOBJVertex(out, ref, positions, texcoords, normals) {
    let vals = ref.split("/");
    let p = positions[parseInt(vals[0])];
    let t = vals[1] ? texcoords[parseInt(vals[1])] : [0, 0];
    let n = vals[2] ? normals[parseInt(vals[2])] : [0, 1, 0];
    out.push(p[0], p[1], p[2], t[0], t[1], n[0], n[1], n[2]);
  }

  initBuffer() {
    this.vertexCount = this.vertices.length / 8;
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
  }

  draw(matrix, color) {
    gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
    gl.uniform1i(u_WhichTexture, -1);
    gl.uniform1f(u_TexColorWeight, 0.0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);

    let normalMatrix = new Matrix4();
    normalMatrix.setInverseOf(matrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 8 * 4, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 8 * 4, 3 * 4);
    gl.enableVertexAttribArray(a_UV);

    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 8 * 4, 5 * 4);
    gl.enableVertexAttribArray(a_Normal);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
  }
}

function initObjModel() {
  // This is a small built-in OBJ model so the assignment still works without fetch/server issues.
  // It is shaped like a low-poly crystal/rock and uses OBJ-style v/vn/f data.
  const objText = `
# low poly crystal OBJ
v 0 1.2 0
v -0.55 0.25 0.55
v 0.55 0.25 0.55
v 0.55 0.25 -0.55
v -0.55 0.25 -0.55
v 0 -1.0 0
vn 0 0.8 0.6
vn 0.6 0.8 0
vn 0 0.8 -0.6
vn -0.6 0.8 0
vn 0 -0.8 0.6
vn 0.6 -0.8 0
vn 0 -0.8 -0.6
vn -0.6 -0.8 0
f 1//1 2//1 3//1
f 1//2 3//2 4//2
f 1//3 4//3 5//3
f 1//4 5//4 2//4
f 6//5 3//5 2//5
f 6//6 4//6 3//6
f 6//7 5//7 4//7
f 6//8 2//8 5//8
`;
  g_objModel = new ObjModel(objText);
}
