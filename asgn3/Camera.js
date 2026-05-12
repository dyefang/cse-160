class Camera {
  constructor(canvas) {
    this.fov = 60;

    this.eye = new Vector3([24, 2.2, 40]);
    this.at = new Vector3([24, 2.2, 39]);
    this.up = new Vector3([0, 1, 0]);

    this.speed = 0.35;
    this.verticalSpeed = 0.35;
    this.alpha = 4;
    this.mouseSensitivity = 0.25;

    // yaw controls left/right turning. pitch controls looking up/down.
    // Starting direction is down -Z, so yaw starts at -90 degrees.
    this.yaw = -90;
    this.pitch = 0;

    this.viewMatrix = new Matrix4();
    this.projectionMatrix = new Matrix4();
    this.projectionMatrix.setPerspective(this.fov, canvas.width / canvas.height, 0.1, 1000);

    this.updateAtFromAngles();
    this.updateViewMatrix();
  }

  updateViewMatrix() {
    this.viewMatrix.setLookAt(
      this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
      this.at.elements[0], this.at.elements[1], this.at.elements[2],
      this.up.elements[0], this.up.elements[1], this.up.elements[2]
    );
  }

  updateAtFromAngles() {
    let yawRad = this.yaw * Math.PI / 180.0;
    let pitchRad = this.pitch * Math.PI / 180.0;

    let x = Math.cos(pitchRad) * Math.cos(yawRad);
    let y = Math.sin(pitchRad);
    let z = Math.cos(pitchRad) * Math.sin(yawRad);

    let f = new Vector3([x, y, z]);
    f.normalize();

    this.at.set(this.eye);
    this.at.add(f);
  }

  forwardVector() {
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    f.normalize();
    return f;
  }

  rightVector() {
    let f = this.forwardVector();
    let r = Vector3.cross(f, this.up);
    r.normalize();
    return r;
  }

  moveForward() {
    this.moveBy(this.forwardVector(), this.speed);
  }

  moveBackwards() {
    let b = this.forwardVector();
    b.mul(-1);
    this.moveBy(b, this.speed);
  }

  moveLeft() {
    let r = this.rightVector();
    r.mul(-1);
    this.moveBy(r, this.speed);
  }

  moveRight() {
    this.moveBy(this.rightVector(), this.speed);
  }

  moveUp() {
    this.eye.elements[1] += this.verticalSpeed;
    this.at.elements[1] += this.verticalSpeed;
    this.updateViewMatrix();
  }

  moveDown() {
    this.eye.elements[1] -= this.verticalSpeed;
    this.at.elements[1] -= this.verticalSpeed;
    this.updateViewMatrix();
  }

  moveBy(v, amount) {
    let step = new Vector3();
    step.set(v);
    step.mul(amount);
    this.eye.add(step);
    this.at.add(step);
    this.updateViewMatrix();
  }

  panLeft(deg) {
    this.rotate(-(deg || this.alpha), 0);
  }

  panRight(deg) {
    this.rotate((deg || this.alpha), 0);
  }

  lookUp(deg) {
    this.rotate(0, deg || this.alpha);
  }

  lookDown(deg) {
    this.rotate(0, -(deg || this.alpha));
  }

  // dx controls horizontal turning, dy controls vertical looking.
  // Dragging diagonally changes both at the same time.
  rotate(dx, dy) {
    this.yaw += dx;
    this.pitch += dy;

    // Keep this just under straight up/down so setLookAt does not flip or break.
    if (this.pitch > 89.5) this.pitch = 89.5;
    if (this.pitch < -89.5) this.pitch = -89.5;

    // Keep yaw readable but still allow unlimited 360-degree horizontal turning.
    if (this.yaw > 360 || this.yaw < -360) this.yaw = this.yaw % 360;

    this.updateAtFromAngles();
    this.updateViewMatrix();
  }
}
