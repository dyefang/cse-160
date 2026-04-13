class Circle {
  constructor() {
    this.type = 'circle';
    this.position = [0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 10.0;
    this.segments = 10;
  }

  render() {
    const xy = this.position;
    const rgba = this.color;
    const size = this.size;
    const segments = this.segments;

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniform1f(u_Size, size);

    const d = size / 200.0;
    const angleStep = 360 / segments;

    for (let angle = 0; angle < 360; angle += angleStep) {
      const angle1 = angle * Math.PI / 180;
      const angle2 = (angle + angleStep) * Math.PI / 180;

      const x1 = xy[0] + Math.cos(angle1) * d;
      const y1 = xy[1] + Math.sin(angle1) * d;
      const x2 = xy[0] + Math.cos(angle2) * d;
      const y2 = xy[1] + Math.sin(angle2) * d;

      drawTriangle([
        xy[0], xy[1],
        x1, y1,
        x2, y2
      ]);
    }
  }
}