let canvas;
let gl;

let a_Position;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_FragColor;

let gAnimalGlobalRotation = 0;
let gMouseXRotation = 0;
let gMouseYRotation = 0;

let gLeftLegAngle = 0;
let gLeftKneeAngle = 0;
let gLeftFootAngle = 0;

let gRightLegAngle = 0;
let gRightKneeAngle = 0;
let gRightFootAngle = 0;

let gLeftArmAngle = 0;
let gRightArmAngle = 0;
let gEarAngle = 0;
let gHeadAngle = 0;

let gAnimation = false;

let gPokeAnimation = false;
let gPokeStartTime = 0;
let gExplodeAmount = 0;

let g_startTime = performance.now() / 1000.0;
let g_seconds = 0;

let g_lastFrameTime = performance.now();
let g_frameCount = 0;
let g_fps = 0;

let g_isDragging = false;
let g_lastMouseX = 0;
let g_lastMouseY = 0;

const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;

  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }
`;

const FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;

  void main() {
    gl_FragColor = u_FragColor;
  }
`;

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  initCubeBuffer();
  initCylinderBuffer();

  gl.clearColor(0.75, 0.9, 1.0, 1.0);

  requestAnimationFrame(tick);
}

function setupWebGL() {
  canvas = document.getElementById("webgl");
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });

  if (!gl) {
    console.log("Failed to get WebGL context");
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to initialize shaders.");
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, "a_Position");
  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, "u_GlobalRotateMatrix");
  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");

  let identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function addActionsForHtmlUI() {
  document.getElementById("angleSlide").addEventListener("input", function() {
    gAnimalGlobalRotation = Number(this.value);
    renderScene();
  });

  document.getElementById("leftLegSlide").addEventListener("input", function() {
    gLeftLegAngle = Number(this.value);
    renderScene();
  });

  document.getElementById("leftKneeSlide").addEventListener("input", function() {
    gLeftKneeAngle = Number(this.value);
    renderScene();
  });

  canvas.onmousedown = function(ev) {
    if (ev.shiftKey) {
      gPokeAnimation = true;
      gPokeStartTime = g_seconds;
      return;
    }

    g_isDragging = true;
    g_lastMouseX = ev.clientX;
    g_lastMouseY = ev.clientY;
  };

  canvas.onmouseup = function() {
    g_isDragging = false;
  };

  canvas.onmousemove = function(ev) {
    if (g_isDragging) {
      let dx = ev.clientX - g_lastMouseX;
      let dy = ev.clientY - g_lastMouseY;

      gMouseYRotation += dx * 0.5;
      gMouseXRotation += dy * 0.5;

      g_lastMouseX = ev.clientX;
      g_lastMouseY = ev.clientY;

      renderScene();
    }
  };
}

function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;

  updateAnimationAngles();
  updateFPS();
  renderScene();

  requestAnimationFrame(tick);
}

function updateFPS() {
  g_frameCount++;

  let now = performance.now();
  let elapsed = now - g_lastFrameTime;

  if (elapsed >= 1000) {
    g_fps = Math.round((g_frameCount * 1000) / elapsed);
    document.getElementById("fps").innerText = "FPS: " + g_fps;

    g_frameCount = 0;
    g_lastFrameTime = now;
  }
}

function updateAnimationAngles() {
  if (gAnimation && !gPokeAnimation) {
    let walk = Math.sin(g_seconds * 3);
    let oppositeWalk = Math.sin(g_seconds * 3 + Math.PI);

    gLeftLegAngle = 22 * walk;
    gRightLegAngle = 22 * oppositeWalk;

    gLeftArmAngle = 25 * oppositeWalk;
    gRightArmAngle = 25 * walk;

    gLeftKneeAngle = 18 + 18 * Math.max(0, -walk);
    gRightKneeAngle = 18 + 18 * Math.max(0, -oppositeWalk);

    gLeftFootAngle = -10 * walk;
    gRightFootAngle = -10 * oppositeWalk;

    gEarAngle = 5 * Math.sin(g_seconds * 5);
    gHeadAngle = 0;
  }

  if (gPokeAnimation) {
  let pokeTime = g_seconds - gPokeStartTime;

  // 0.0 - 1.0 sec: explode outward
  // 1.0 - 4.0 sec: stay exploded
  // 4.0 - 5.0 sec: come back together

  if (pokeTime < 1.0) {
    // explode outward
    gExplodeAmount = Math.sin((pokeTime / 1.0) * Math.PI / 2) * 1.4;

  } else if (pokeTime < 4.0) {
    // stay fully exploded for 3 seconds
    gExplodeAmount = 1.4;

  } else if (pokeTime < 5.0) {
    // return back together
    let returnTime = pokeTime - 4.0;
    gExplodeAmount = Math.cos((returnTime / 1.0) * Math.PI / 2) * 1.4;

  } else {
    // animation finished
    gPokeAnimation = false;
    gExplodeAmount = 0;
  }

  gLeftArmAngle = 0;
  gRightArmAngle = 0;
  gLeftLegAngle = 0;
  gRightLegAngle = 0;
  gLeftKneeAngle = 0;
  gRightKneeAngle = 0;
  gLeftFootAngle = 0;
  gRightFootAngle = 0;
  gEarAngle = 0;
  gHeadAngle = 0;
}
}

function renderScene() {
  let globalRotMat = new Matrix4();

  globalRotMat.rotate(gMouseXRotation, 1, 0, 0);
  globalRotMat.rotate(gAnimalGlobalRotation + gMouseYRotation, 0, 1, 0);

  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  let koalaMatrix = new Matrix4();
  koalaMatrix.scale(0.65, 0.65, 0.65);

  drawKoala(koalaMatrix);
}