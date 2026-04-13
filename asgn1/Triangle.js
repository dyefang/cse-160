class Triangle {
  constructor() {
    this.type = 'triangle';
    this.position = [0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 10.0;
    this.vertices = null;
  }

  render() {
    const rgba = this.color;
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniform1f(u_Size, this.size);

    if (this.vertices) {
      drawTriangle(this.vertices);
      return;
    }

    const d = this.size / 200.0;
    const x = this.position[0];
    const y = this.position[1];

    drawTriangle([
      x, y + d,
      x - d, y - d,
      x + d, y - d
    ]);
  }
}

function drawTriangle(vertices) {
  const n = 3;

  const vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}