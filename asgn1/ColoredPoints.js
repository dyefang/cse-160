// Vertex shader program
const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }
`;

// Fragment shader program
const FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }
`;

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedType = POINT;
let g_selectedColor = [1.0, 0.0, 0.0, 1.0];
let g_selectedSize = 12.0;
let g_selectedSegments = 12;

let g_shapesList = [];

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  canvas.onmousedown = function(ev) {
    click(ev);
  };

  canvas.onmousemove = function(ev) {
    if (ev.buttons === 1) {
      click(ev);
    }
  };

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function setupWebGL() {
  canvas = document.getElementById('webgl');
  gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });

  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
  }
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders.');
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

function addActionsForHtmlUI() {
  document.getElementById('pointButton').onclick = function() {
    g_selectedType = POINT;
  };

  document.getElementById('triangleButton').onclick = function() {
    g_selectedType = TRIANGLE;
  };

  document.getElementById('circleButton').onclick = function() {
    g_selectedType = CIRCLE;
  };

  document.getElementById('clearButton').onclick = function() {
    g_shapesList = [];
    renderAllShapes();
  };

  document.getElementById('drawPictureButton').onclick = function() {
    g_shapesList = [];
    generatePicture();
    renderAllShapes();
  };

  document.getElementById('redSlide').addEventListener('input', function() {
    g_selectedColor[0] = this.value / 100;
  });

  document.getElementById('greenSlide').addEventListener('input', function() {
    g_selectedColor[1] = this.value / 100;
  });

  document.getElementById('blueSlide').addEventListener('input', function() {
    g_selectedColor[2] = this.value / 100;
  });

  document.getElementById('sizeSlide').addEventListener('input', function() {
    g_selectedSize = Number(this.value);
  });

  document.getElementById('segmentSlide').addEventListener('input', function() {
    g_selectedSegments = Number(this.value);
  });

  document.getElementById('alphaSlide').addEventListener('input', function() {
  g_selectedColor[3] = this.value / 100;
});
}

function click(ev) {
  const [x, y] = convertCoordinatesEventToGL(ev);

  let shape;
  if (g_selectedType === POINT) {
    shape = new Point();
  } else if (g_selectedType === TRIANGLE) {
    shape = new Triangle();
  } else {
    shape = new Circle();
    shape.segments = g_selectedSegments;
  }

  shape.position = [x, y];
  shape.color = g_selectedColor.slice();
  shape.size = g_selectedSize;

  g_shapesList.push(shape);
  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  let x = ev.clientX;
  let y = ev.clientY;
  const rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return [x, y];
}

function renderAllShapes() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  const len = g_shapesList.length;
  for (let i = 0; i < len; i++) {
    g_shapesList[i].render();
  }
}

// ----------------------
// Picture made of triangles
// ----------------------
function addPictureTriangle(vertices, color) {
  const tri = new Triangle();
  tri.vertices = vertices;
  tri.color = color.slice();
  tri.size = 1;
  g_shapesList.push(tri);
}

function generatePicture() {
  // Background
  addPictureTriangle([-1.0,  1.0,  1.0,  1.0, -1.0, -1.0], [0.95, 0.97, 1.0, 1.0]);
  addPictureTriangle([ 1.0,  1.0,  1.0, -1.0, -1.0, -1.0], [0.95, 0.97, 1.0, 1.0]);

  // LEFT EAR
  addPictureTriangle([-0.78, 0.68, -0.48, 0.82, -0.58, 0.42], [0.72, 0.48, 0.36, 1.0]);
  addPictureTriangle([-0.78, 0.68, -0.90, 0.42, -0.58, 0.42], [0.66, 0.42, 0.31, 1.0]);
  addPictureTriangle([-0.48, 0.82, -0.42, 0.52, -0.58, 0.42], [0.82, 0.62, 0.48, 1.0]);
  addPictureTriangle([-0.90, 0.42, -0.78, 0.22, -0.58, 0.42], [0.58, 0.34, 0.26, 1.0]);
  addPictureTriangle([-0.58, 0.42, -0.42, 0.52, -0.50, 0.28], [0.50, 0.28, 0.22, 1.0]);

  // RIGHT EAR
  addPictureTriangle([0.78, 0.68, 0.48, 0.82, 0.58, 0.42], [0.72, 0.48, 0.36, 1.0]);
  addPictureTriangle([0.78, 0.68, 0.90, 0.42, 0.58, 0.42], [0.66, 0.42, 0.31, 1.0]);
  addPictureTriangle([0.48, 0.82, 0.42, 0.52, 0.58, 0.42], [0.82, 0.62, 0.48, 1.0]);
  addPictureTriangle([0.90, 0.42, 0.78, 0.22, 0.58, 0.42], [0.58, 0.34, 0.26, 1.0]);
  addPictureTriangle([0.58, 0.42, 0.42, 0.52, 0.50, 0.28], [0.50, 0.28, 0.22, 1.0]);

  // TOP OF HEAD
  addPictureTriangle([-0.48, 0.60, 0.00, 0.72, -0.22, 0.38], [0.89, 0.72, 0.52, 1.0]);
  addPictureTriangle([0.48, 0.60, 0.00, 0.72, 0.22, 0.38], [0.89, 0.72, 0.52, 1.0]);
  addPictureTriangle([-0.48, 0.60, -0.22, 0.38, -0.55, 0.05], [0.85, 0.67, 0.48, 1.0]);
  addPictureTriangle([0.48, 0.60, 0.22, 0.38, 0.55, 0.05], [0.85, 0.67, 0.48, 1.0]);

  // CENTER FOREHEAD WHITE PATCH
  addPictureTriangle([-0.14, 0.52, 0.00, 0.72, 0.14, 0.52], [0.98, 0.98, 0.96, 1.0]);
  addPictureTriangle([-0.14, 0.52, 0.00, 0.30, 0.14, 0.52], [0.96, 0.96, 0.94, 1.0]);

  // LEFT CHEEK / FACE
  addPictureTriangle([-0.55, 0.05, -0.22, 0.38, -0.18, -0.02], [0.87, 0.69, 0.50, 1.0]);
  addPictureTriangle([-0.55, 0.05, -0.18, -0.02, -0.70, -0.18], [0.84, 0.66, 0.47, 1.0]);
  addPictureTriangle([-0.70, -0.18, -0.18, -0.02, -0.30, -0.40], [0.82, 0.64, 0.45, 1.0]);

  // RIGHT CHEEK / FACE
  addPictureTriangle([0.55, 0.05, 0.22, 0.38, 0.18, -0.02], [0.87, 0.69, 0.50, 1.0]);
  addPictureTriangle([0.55, 0.05, 0.18, -0.02, 0.70, -0.18], [0.84, 0.66, 0.47, 1.0]);
  addPictureTriangle([0.70, -0.18, 0.18, -0.02, 0.30, -0.40], [0.82, 0.64, 0.45, 1.0]);

  // LEFT MUZZLE
  addPictureTriangle([-0.30, -0.08, 0.00, -0.02, -0.18, -0.42], [0.97, 0.96, 0.92, 1.0]);
  addPictureTriangle([-0.30, -0.08, -0.18, -0.42, -0.48, -0.32], [0.95, 0.94, 0.90, 1.0]);
  addPictureTriangle([-0.48, -0.32, -0.18, -0.42, -0.30, -0.56], [0.94, 0.93, 0.89, 1.0]);

  // RIGHT MUZZLE
  addPictureTriangle([0.30, -0.08, 0.00, -0.02, 0.18, -0.42], [0.97, 0.96, 0.92, 1.0]);
  addPictureTriangle([0.30, -0.08, 0.18, -0.42, 0.48, -0.32], [0.95, 0.94, 0.90, 1.0]);
  addPictureTriangle([0.48, -0.32, 0.18, -0.42, 0.30, -0.56], [0.94, 0.93, 0.89, 1.0]);

  // NOSE
  addPictureTriangle([-0.10, -0.02, 0.10, -0.02, 0.00, -0.18], [0.08, 0.08, 0.08, 1.0]);
  addPictureTriangle([-0.10, -0.02, 0.00, 0.04, 0.10, -0.02], [0.12, 0.12, 0.12, 1.0]);

  // TONGUE
  addPictureTriangle([-0.14, -0.24, 0.14, -0.24, 0.00, -0.50], [0.95, 0.55, 0.70, 1.0]);
  addPictureTriangle([-0.14, -0.24, -0.02, -0.50, -0.12, -0.40], [0.90, 0.45, 0.62, 1.0]);
  addPictureTriangle([0.14, -0.24, 0.02, -0.50, 0.12, -0.40], [0.90, 0.45, 0.62, 1.0]);
  addPictureTriangle([-0.01, -0.28, 0.01, -0.28, 0.00, -0.48], [0.82, 0.40, 0.56, 1.0]);

  // LEFT EYE
  addPictureTriangle([-0.36, 0.18, -0.26, 0.30, -0.22, -0.02], [0.10, 0.10, 0.10, 1.0]);
  addPictureTriangle([-0.36, 0.18, -0.30, -0.02, -0.22, -0.02], [0.08, 0.08, 0.08, 1.0]);
  addPictureTriangle([-0.31, 0.22, -0.27, 0.26, -0.27, 0.16], [1.0, 1.0, 1.0, 1.0]);

  // RIGHT EYE
  addPictureTriangle([0.36, 0.18, 0.26, 0.30, 0.22, -0.02], [0.10, 0.10, 0.10, 1.0]);
  addPictureTriangle([0.36, 0.18, 0.30, -0.02, 0.22, -0.02], [0.08, 0.08, 0.08, 1.0]);
  addPictureTriangle([0.31, 0.22, 0.27, 0.26, 0.27, 0.16], [1.0, 1.0, 1.0, 1.0]);

  // EYEBROWS
  addPictureTriangle([-0.34, 0.40, -0.16, 0.34, -0.24, 0.30], [0.70, 0.52, 0.36, 1.0]);
  addPictureTriangle([0.34, 0.40, 0.16, 0.34, 0.24, 0.30], [0.70, 0.52, 0.36, 1.0]);

  // COLLAR
  addPictureTriangle([-0.36, -0.58, 0.36, -0.58, -0.28, -0.76], [0.88, 0.20, 0.28, 1.0]);
  addPictureTriangle([0.36, -0.58, 0.28, -0.76, -0.28, -0.76], [0.82, 0.16, 0.24, 1.0]);

  // TAG OUTER (slightly bigger)
  addPictureTriangle([-0.11, -0.77, 0.11, -0.77, 0.00, -0.98], [0.95, 0.82, 0.22, 1.0]);
  addPictureTriangle([-0.11, -0.77, 0.00, -0.61, 0.11, -0.77], [0.98, 0.86, 0.30, 1.0]);

  // INITIAL "D" ON TAG
  addPictureTriangle([-0.055, -0.89, -0.055, -0.77, -0.025, -0.83], [0.35, 0.24, 0.08, 1.0]);
  addPictureTriangle([-0.055, -0.89, -0.025, -0.83, -0.055, -0.77], [0.35, 0.24, 0.08, 1.0]);

  // INITIAL "F" ON TAG
  addPictureTriangle([0.015, -0.77, 0.015, -0.89, 0.045, -0.77], [0.35, 0.24, 0.08, 1.0]);
  addPictureTriangle([0.015, -0.82, 0.040, -0.82, 0.015, -0.85], [0.35, 0.24, 0.08, 1.0]);
}

// ----------------------
// Minimal shader helpers
// ----------------------
function initShaders(gl, vshader, fshader) {
  const program = createProgram(gl, vshader, fshader);
  if (!program) {
    console.log('Failed to create program');
    return false;
  }

  gl.useProgram(program);
  gl.program = program;
  return true;
}

function createProgram(gl, vshader, fshader) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);
  if (!vertexShader || !fragmentShader) {
    return null;
  }

  const program = gl.createProgram();
  if (!program) {
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    const error = gl.getProgramInfoLog(program);
    console.log('Failed to link program: ' + error);
    gl.deleteProgram(program);
    gl.deleteShader(fragmentShader);
    gl.deleteShader(vertexShader);
    return null;
  }

  return program;
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (shader == null) {
    console.log('unable to create shader');
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    const error = gl.getShaderInfoLog(shader);
    console.log('Failed to compile shader: ' + error);
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}