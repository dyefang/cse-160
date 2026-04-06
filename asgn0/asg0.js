let canvas;
let ctx;

function main() {
  canvas = document.getElementById('example');
  if (!canvas) {
    console.log('Failed to retrieve the <canvas> element');
    return false;
  }

  ctx = canvas.getContext('2d');
  if (!ctx) {
    console.log('Failed to get the 2D context');
    return false;
  }

  clearCanvas();

  let v1 = new Vector3([2.25, 2.25, 0]);
  drawVector(v1, 'red');
}

function clearCanvas() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawVector(v, color) {
  let cx = canvas.width / 2;
  let cy = canvas.height / 2;

  let x = cx + v.elements[0] * 20;
  let y = cy - v.elements[1] * 20;

  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(x, y);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function getV1() {
  let x = parseFloat(document.getElementById('v1x').value);
  let y = parseFloat(document.getElementById('v1y').value);
  return new Vector3([x, y, 0]);
}

function getV2() {
  let x = parseFloat(document.getElementById('v2x').value);
  let y = parseFloat(document.getElementById('v2y').value);
  return new Vector3([x, y, 0]);
}

function copyVector(v) {
  return new Vector3([v.elements[0], v.elements[1], v.elements[2]]);
}

function handleDrawEvent() {
  clearCanvas();

  let v1 = getV1();
  let v2 = getV2();

  drawVector(v1, 'red');
  drawVector(v2, 'blue');
}

function handleDrawOperationEvent() {
  clearCanvas();

  let v1 = getV1();
  let v2 = getV2();
  let op = document.getElementById('operation').value;
  let scalar = parseFloat(document.getElementById('scalar').value);

  drawVector(v1, 'red');
  drawVector(v2, 'blue');

  if (op === 'add') {
    let v3 = copyVector(v1);
    v3.add(v2);
    drawVector(v3, 'green');
  } else if (op === 'sub') {
    let v3 = copyVector(v1);
    v3.sub(v2);
    drawVector(v3, 'green');
  } else if (op === 'mul') {
    let v3 = copyVector(v1);
    let v4 = copyVector(v2);
    v3.mul(scalar);
    v4.mul(scalar);
    drawVector(v3, 'green');
    drawVector(v4, 'green');
  } else if (op === 'div') {
    let v3 = copyVector(v1);
    let v4 = copyVector(v2);
    v3.div(scalar);
    v4.div(scalar);
    drawVector(v3, 'green');
    drawVector(v4, 'green');
  } else if (op === 'magnitude') {
    console.log('Magnitude v1 =', v1.magnitude());
    console.log('Magnitude v2 =', v2.magnitude());
  } else if (op === 'normalize') {
    let v3 = copyVector(v1);
    let v4 = copyVector(v2);
    v3.normalize();
    v4.normalize();
    drawVector(v3, 'green');
    drawVector(v4, 'green');
  } else if (op === 'angle') {
    console.log('Angle =', angleBetween(v1, v2), 'degrees');
  } else if (op === 'area') {
    console.log('Area of triangle =', areaTriangle(v1, v2));
  }
}

function angleBetween(v1, v2) {
  let dot = Vector3.dot(v1, v2);
  let mag1 = v1.magnitude();
  let mag2 = v2.magnitude();

  let cosAlpha = dot / (mag1 * mag2);

  if (cosAlpha > 1) cosAlpha = 1;
  if (cosAlpha < -1) cosAlpha = -1;

  let angleRadians = Math.acos(cosAlpha);
  return angleRadians * 180 / Math.PI;
}

function areaTriangle(v1, v2) {
  let cross = Vector3.cross(v1, v2);
  return cross.magnitude() / 2;
}