let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_ModelMatrix;
let u_NormalMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_GlobalRotateMatrix;
let u_FragColor;
let u_Sampler0, u_Sampler1, u_Sampler2, u_Sampler3, u_Sampler4, u_Sampler5, u_Sampler6, u_Sampler7;
let u_WhichTexture;
let u_TexColorWeight;
let u_FogColor;
let u_FogStart;
let u_FogEnd;
let u_UseFog;

// Lighting uniforms
let u_CameraPos;
let u_LightPos;
let u_LightColor;
let u_SpotLightPos;
let u_SpotLightDir;
let u_UseLighting;
let u_ShowNormals;
let u_PointLightOn;
let u_SpotLightOn;

let camera;
let g_map = [];
let g_keys = {};
let g_texturesLoaded = 0;
let g_totalTextures = 8;
let g_lastFrameTime = performance.now();
let g_fps = 0;
let g_isDragging = false;
let g_lastMouseX = 0;
let g_lastMouseY = 0;
let g_startTime = performance.now() / 1000.0;
let g_seconds = 0;

let g_crystals = [];
let g_collectedCrystals = 0;
let g_totalCrystals = 4;
let g_gameWon = false;
let g_lastStoryMessage = "Find 4 glowing leaf crystals, then return to the Koala Grove.";

let gAnimalGlobalRotation = 0;
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
let gAnimation = true;
let gPokeAnimation = false;
let gPokeStartTime = 0;
let gExplodeAmount = 0;

// Assignment 5 lighting state
let g_useLighting = true;
let g_showNormals = false;
let g_pointLightOn = true;
let g_spotLightOn = true;
let g_lightPos = [24, 7, 24];
let g_lightColor = [1, 1, 1];
let g_animatePointLight = true;

const TEX_GRASS = 0;
const TEX_DIRT = 1;
const TEX_STONE = 2;
const TEX_WOOD = 3;
const TEX_LEAVES = 4;
const TEX_SAND = 5;
const TEX_WATER = 6;
const TEX_SKY = 7;

const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;

  varying vec2 v_UV;
  varying float v_Distance;
  varying vec3 v_Normal;
  varying vec3 v_WorldPos;

  uniform mat4 u_ModelMatrix;
  uniform mat4 u_NormalMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  uniform mat4 u_GlobalRotateMatrix;

  void main() {
    vec4 worldPosition = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    vec4 viewPosition = u_ViewMatrix * worldPosition;
    gl_Position = u_ProjectionMatrix * viewPosition;

    v_UV = a_UV;
    v_Distance = length(viewPosition.xyz);
    v_WorldPos = worldPosition.xyz;
    v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 0.0)));
  }
`;

const FSHADER_SOURCE = `
  precision mediump float;

  varying vec2 v_UV;
  varying float v_Distance;
  varying vec3 v_Normal;
  varying vec3 v_WorldPos;

  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform sampler2D u_Sampler4;
  uniform sampler2D u_Sampler5;
  uniform sampler2D u_Sampler6;
  uniform sampler2D u_Sampler7;
  uniform int u_WhichTexture;
  uniform float u_TexColorWeight;

  uniform vec3 u_FogColor;
  uniform float u_FogStart;
  uniform float u_FogEnd;
  uniform int u_UseFog;

  uniform vec3 u_CameraPos;
  uniform vec3 u_LightPos;
  uniform vec3 u_LightColor;
  uniform vec3 u_SpotLightPos;
  uniform vec3 u_SpotLightDir;
  uniform int u_UseLighting;
  uniform int u_ShowNormals;
  uniform int u_PointLightOn;
  uniform int u_SpotLightOn;

  vec4 getBaseColor() {
    vec4 texColor;
    if (u_WhichTexture == 0) texColor = texture2D(u_Sampler0, v_UV);
    else if (u_WhichTexture == 1) texColor = texture2D(u_Sampler1, v_UV);
    else if (u_WhichTexture == 2) texColor = texture2D(u_Sampler2, v_UV);
    else if (u_WhichTexture == 3) texColor = texture2D(u_Sampler3, v_UV);
    else if (u_WhichTexture == 4) texColor = texture2D(u_Sampler4, v_UV);
    else if (u_WhichTexture == 5) texColor = texture2D(u_Sampler5, v_UV);
    else if (u_WhichTexture == 6) texColor = texture2D(u_Sampler6, v_UV);
    else if (u_WhichTexture == 7) texColor = texture2D(u_Sampler7, v_UV);
    else texColor = u_FragColor;
    return (1.0 - u_TexColorWeight) * u_FragColor + u_TexColorWeight * texColor;
  }

  vec3 phongFromLight(vec3 lightPos, vec3 lightColor, float intensity) {
    vec3 N = normalize(v_Normal);
    vec3 L = normalize(lightPos - v_WorldPos);
    vec3 V = normalize(u_CameraPos - v_WorldPos);
    vec3 R = reflect(-L, N);

    float diffuse = max(dot(N, L), 0.0);
    float specular = pow(max(dot(V, R), 0.0), 32.0);

    return intensity * lightColor * (0.70 * diffuse + 0.45 * specular);
  }

  void main() {
    if (u_ShowNormals == 1) {
      gl_FragColor = vec4(normalize(v_Normal) * 0.5 + 0.5, 1.0);
      return;
    }

    vec4 baseColor = getBaseColor();
    vec3 litColor = baseColor.rgb;

    if (u_UseLighting == 1) {
      vec3 ambient = 0.22 * baseColor.rgb;
      vec3 lightTotal = ambient;

      if (u_PointLightOn == 1) {
        lightTotal += baseColor.rgb * phongFromLight(u_LightPos, u_LightColor, 1.0);
      }

      if (u_SpotLightOn == 1) {
        vec3 spotToFrag = normalize(v_WorldPos - u_SpotLightPos);
        float theta = dot(spotToFrag, normalize(u_SpotLightDir));
        float cutoff = 0.88;
        float outerCutoff = 0.78;
        float spotAmount = clamp((theta - outerCutoff) / (cutoff - outerCutoff), 0.0, 1.0);
        lightTotal += baseColor.rgb * phongFromLight(u_SpotLightPos, vec3(1.0, 0.92, 0.65), spotAmount * 1.3);
      }

      litColor = lightTotal;
    }

    if (u_UseFog == 1) {
      float fogFactor = clamp((u_FogEnd - v_Distance) / (u_FogEnd - u_FogStart), 0.0, 1.0);
      litColor = mix(u_FogColor, litColor, fogFactor);
    }

    gl_FragColor = vec4(litColor, baseColor.a);
  }
`;

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  initCubeBuffer();
  initCylinderBuffer();
  initSphereBuffer();
  initObjModel();
  initTextures();
  createWorld();
  camera = new Camera(canvas);
  setupInput();
  setupLightingUI();
  gl.clearColor(0.52, 0.78, 1.0, 1.0);
  requestAnimationFrame(tick);
}

function setupWebGL() {
  canvas = document.getElementById("webgl");
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) { console.log("Failed to get WebGL context"); return; }
  gl.enable(gl.DEPTH_TEST);
  gl.viewport(0, 0, canvas.width, canvas.height);
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to initialize shaders.");
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, "a_Position");
  a_UV = gl.getAttribLocation(gl.program, "a_UV");
  a_Normal = gl.getAttribLocation(gl.program, "a_Normal");

  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
  u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, "u_ProjectionMatrix");
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, "u_GlobalRotateMatrix");
  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  u_WhichTexture = gl.getUniformLocation(gl.program, "u_WhichTexture");
  u_TexColorWeight = gl.getUniformLocation(gl.program, "u_TexColorWeight");
  u_FogColor = gl.getUniformLocation(gl.program, "u_FogColor");
  u_FogStart = gl.getUniformLocation(gl.program, "u_FogStart");
  u_FogEnd = gl.getUniformLocation(gl.program, "u_FogEnd");
  u_UseFog = gl.getUniformLocation(gl.program, "u_UseFog");

  u_CameraPos = gl.getUniformLocation(gl.program, "u_CameraPos");
  u_LightPos = gl.getUniformLocation(gl.program, "u_LightPos");
  u_LightColor = gl.getUniformLocation(gl.program, "u_LightColor");
  u_SpotLightPos = gl.getUniformLocation(gl.program, "u_SpotLightPos");
  u_SpotLightDir = gl.getUniformLocation(gl.program, "u_SpotLightDir");
  u_UseLighting = gl.getUniformLocation(gl.program, "u_UseLighting");
  u_ShowNormals = gl.getUniformLocation(gl.program, "u_ShowNormals");
  u_PointLightOn = gl.getUniformLocation(gl.program, "u_PointLightOn");
  u_SpotLightOn = gl.getUniformLocation(gl.program, "u_SpotLightOn");

  u_Sampler0 = gl.getUniformLocation(gl.program, "u_Sampler0");
  u_Sampler1 = gl.getUniformLocation(gl.program, "u_Sampler1");
  u_Sampler2 = gl.getUniformLocation(gl.program, "u_Sampler2");
  u_Sampler3 = gl.getUniformLocation(gl.program, "u_Sampler3");
  u_Sampler4 = gl.getUniformLocation(gl.program, "u_Sampler4");
  u_Sampler5 = gl.getUniformLocation(gl.program, "u_Sampler5");
  u_Sampler6 = gl.getUniformLocation(gl.program, "u_Sampler6");
  u_Sampler7 = gl.getUniformLocation(gl.program, "u_Sampler7");

  let identity = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identity.elements);
  gl.uniformMatrix4fv(u_NormalMatrix, false, identity.elements);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, identity.elements);
  gl.uniform3f(u_FogColor, 0.52, 0.78, 1.0);
  gl.uniform1f(u_FogStart, 18.0);
  gl.uniform1f(u_FogEnd, 58.0);
  gl.uniform1i(u_UseFog, 1);
}

function initTextures() {
  const files = ["grass.png", "dirt.png", "stone.png", "wood.png", "leaves.png", "sand.png", "water.png", "sky.png"];
  for (let i = 0; i < files.length; i++) loadTexture(i, "textures/" + files[i]);
}

function loadTexture(unit, src) {
  let texture = gl.createTexture();
  let image = new Image();
  image.onload = function() {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i([u_Sampler0,u_Sampler1,u_Sampler2,u_Sampler3,u_Sampler4,u_Sampler5,u_Sampler6,u_Sampler7][unit], unit);
    g_texturesLoaded++;
  };
  image.onerror = function() { console.log("Texture failed to load: " + src); };
  image.src = src;
}

function setupLightingUI() {
  updateLightSlider();
}

function updateLightSlider() {
  let x = document.getElementById("lightXSlider");
  let y = document.getElementById("lightYSlider");
  let z = document.getElementById("lightZSlider");
  let r = document.getElementById("lightRSlider");
  let g = document.getElementById("lightGSlider");
  let b = document.getElementById("lightBSlider");

  if (!x) return;

  g_lightPos = [parseFloat(x.value), parseFloat(y.value), parseFloat(z.value)];
  g_lightColor = [parseFloat(r.value), parseFloat(g.value), parseFloat(b.value)];
  g_animatePointLight = false;
}

function toggleLighting() { g_useLighting = !g_useLighting; }
function toggleNormals() { g_showNormals = !g_showNormals; }
function togglePointLight() { g_pointLightOn = !g_pointLightOn; }
function toggleSpotLight() { g_spotLightOn = !g_spotLightOn; }

function setupInput() {
  document.addEventListener("keydown", function(ev) {
    g_keys[ev.key.toLowerCase()] = true;
    if (ev.key.toLowerCase() === "f") addBlockInFront();
    if (ev.key.toLowerCase() === "r") removeBlockInFront();
    if (ev.key.toLowerCase() === "l") g_animatePointLight = !g_animatePointLight;
  });

  document.addEventListener("keyup", function(ev) { g_keys[ev.key.toLowerCase()] = false; });

  canvas.onmousedown = function(ev) {
    if (ev.shiftKey) {
      gPokeAnimation = true;
      gPokeStartTime = performance.now() / 1000.0;
    }
    g_isDragging = true;
    g_lastMouseX = ev.clientX;
    g_lastMouseY = ev.clientY;
  };

  canvas.onmouseup = function() { g_isDragging = false; };

  canvas.onmousemove = function(ev) {
    if (!g_isDragging) return;
    let dx = ev.clientX - g_lastMouseX;
    let dy = ev.clientY - g_lastMouseY;
    camera.rotate(dx * camera.mouseSensitivity, -dy * camera.mouseSensitivity);
    g_lastMouseX = ev.clientX;
    g_lastMouseY = ev.clientY;
  };
}

function handleMovement() {
  if (g_keys["w"]) camera.moveForward();
  if (g_keys["s"]) camera.moveBackwards();
  if (g_keys["a"]) camera.moveLeft();
  if (g_keys["d"]) camera.moveRight();
  if (g_keys["q"]) camera.panLeft();
  if (g_keys["e"]) camera.panRight();
  if (g_keys[" "]) camera.moveUp();
  if (g_keys["shift"]) camera.moveDown();
  keepCameraInBounds();
}

function keepCameraInBounds() {
  for (let v of [camera.eye, camera.at]) {
    v.elements[0] = Math.max(1, Math.min(47, v.elements[0]));
    v.elements[2] = Math.max(1, Math.min(47, v.elements[2]));
    v.elements[1] = Math.max(0.75, Math.min(12, v.elements[1]));
  }
  camera.updateViewMatrix();
}

function createWorld() {
  for (let x = 0; x < 48; x++) {
    g_map[x] = [];
    for (let z = 0; z < 48; z++) {
      let border = (x === 0 || z === 0 || x === 47 || z === 47);
      let maze = ((x % 6 === 0 && z > 3 && z < 44) || (z % 7 === 0 && x > 4 && x < 43));
      let clearing = (x > 20 && x < 28 && z > 20 && z < 28);

      if (border) g_map[x][z] = 4;
      else if (clearing) g_map[x][z] = 0;
      else if (maze && Math.random() > 0.35) g_map[x][z] = 1 + ((x + z) % 3);
      else if ((x - 36) * (x - 36) + (z - 11) * (z - 11) < 18) g_map[x][z] = -1;
      else g_map[x][z] = 0;
    }
  }

  addTree(8, 9); addTree(38, 38); addTree(10, 36); addTree(34, 7); addTree(24, 38); addTree(40, 20); addTree(14, 15);

  for (let x = 21; x <= 27; x++) {
    for (let z = 21; z <= 27; z++) g_map[x][z] = 0;
  }

  addGiantKoalaTree(24, 24);

  g_crystals = [
    {x: 6,  y: 2.2, z: 6,  collected: false},
    {x: 41, y: 2.2, z: 8,  collected: false},
    {x: 8,  y: 2.2, z: 40, collected: false},
    {x: 42, y: 5.2, z: 42, collected: false}
  ];

  g_map[42][42] = 5;
}

function addTree(x, z) {
  g_map[x][z] = 10;
}

function drawWorld() {
  let day = (Math.sin(g_seconds * 0.15) + 1.0) / 2.0;
  let skyR = 0.12 + 0.43 * day;
  let skyG = 0.20 + 0.60 * day;
  let skyB = 0.38 + 0.62 * day;

  gl.clearColor(skyR, skyG, skyB, 1.0);
  gl.uniform3f(u_FogColor, skyR, skyG, skyB);
  gl.uniform1f(u_FogStart, 18.0);
  gl.uniform1f(u_FogEnd, g_gameWon ? 78.0 : 58.0);
  gl.uniform1i(u_UseFog, 1);

  let M = new Matrix4();
  M.translate(24, -0.53, 24);
  M.scale(50, 0.08, 50);
  drawCube(M, [0.45, 0.8, 0.35, 1], TEX_GRASS, 1.0);

  gl.uniform1i(u_UseFog, 0);
  M = new Matrix4();
  M.translate(24, 20, 24);
  M.scale(120, 120, 120);
  drawCube(M, [skyR, skyG, skyB, 1], TEX_SKY, 0.45);
  gl.uniform1i(u_UseFog, 1);

  drawFloatingIsland(10, 10, 7);
  drawFloatingIsland(34, 34, 8.5);
  drawFloatingIsland(39, 12, 6.5);

  for (let x = 0; x < 48; x++) {
    for (let z = 0; z < 48; z++) {
      let h = g_map[x][z];
      if (h === -1) {
        drawAnimatedWater(x, -0.35, z);
      } else if (h === 10) {
        drawTree(x, z);
      } else if (h === 11) {
        drawGiantKoalaTree(x, z);
      } else if (h === 5) {
        for (let y = 0; y < 4; y++) drawBlock(x, y, z, TEX_LEAVES, [0.4, 1.0, 0.35, 1]);
        drawBeacon(x, 4.5, z);
      } else if (h > 0) {
        for (let y = 0; y < h; y++) {
          let tex = y === h - 1 ? TEX_STONE : TEX_DIRT;
          drawBlock(x, y, z, tex, [0.75, 0.75, 0.75, 1]);
        }
      }
    }
  }

  drawAssignment5Objects();
  drawCrystals();
  drawKoalaGrove();
  drawLightMarker();
}

function drawAssignment5Objects() {
  // Extra spheres make it obvious that Phong/specular lighting is working.
  let S = new Matrix4();
  S.translate(19, 1.2, 23);
  S.scale(2.0, 2.0, 2.0);
  drawSphere(S, [0.85, 0.2, 0.25, 1], -1, 0);

  S = new Matrix4();
  S.translate(29, 1.0, 24);
  S.scale(1.6, 1.6, 1.6);
  drawSphere(S, [0.2, 0.35, 1.0, 1], -1, 0);

  S = new Matrix4();
  S.translate(24, 1.0, 18);
  S.scale(1.4, 1.4, 1.4);
  drawSphere(S, [1.0, 0.85, 0.25, 1], -1, 0);

  // OBJ model loaded through ObjModel parser.
  if (g_objModel) {
    let O = new Matrix4();
    O.translate(24, 1.4, 29);
    O.rotate(g_seconds * 35, 0, 1, 0);
    O.scale(1.4, 1.4, 1.4);
    g_objModel.draw(O, [0.7, 0.85, 1.0, 1]);
  }
}

function drawLightMarker() {
  let oldLighting = g_useLighting;
  gl.uniform1i(u_UseLighting, 0);

  let L = new Matrix4();
  L.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  L.scale(0.35, 0.35, 0.35);
  drawCube(L, [g_lightColor[0], g_lightColor[1], g_lightColor[2], 1], -1, 0);

  gl.uniform1i(u_UseLighting, oldLighting ? 1 : 0);
}

function drawBlock(x, y, z, tex, color) {
  let M = new Matrix4();
  M.translate(x, y, z);
  drawCube(M, color, tex, 1.0);
}

function drawTree(x, z) {
  let M = new Matrix4();
  M.translate(x, 0.7, z);
  M.scale(0.65, 2.2, 0.65);
  drawCube(M, [0.5,0.3,0.12,1], TEX_WOOD, 1.0);

  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      let L = new Matrix4();
      L.translate(x + dx * 0.55, 2.3, z + dz * 0.55);
      L.scale(0.9, 0.9, 0.9);
      drawCube(L, [0.2,0.7,0.2,1], TEX_LEAVES, 1.0);
    }
  }
}

function addGiantKoalaTree(x, z) {
  g_map[x][z] = 11;
}

function drawGiantKoalaTree(x, z) {
  let trunk = new Matrix4();
  trunk.translate(x, 1.6, z);
  trunk.scale(1.2, 4.8, 1.2);
  drawCube(trunk, [0.45, 0.25, 0.1, 1], TEX_WOOD, 1.0);

  for (let layer = 0; layer < 3; layer++) {
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        if (Math.abs(dx) + Math.abs(dz) > 4 - layer) continue;
        let leaves = new Matrix4();
        leaves.translate(x + dx * 0.55, 4.2 + layer * 0.55, z + dz * 0.55);
        let pulse = 0.08 * Math.sin(g_seconds * 3.0 + dx + dz);
        leaves.scale(1.0 + pulse, 1.0 + pulse, 1.0 + pulse);
        drawCube(leaves, [0.28, 0.95, 0.28, 1], TEX_LEAVES, 0.85);
      }
    }
  }

  drawBeacon(x, 6.6, z);
}

function drawFloatingIsland(x, z, y) {
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      let island = new Matrix4();
      island.translate(x + dx, y, z + dz);
      island.scale(1.0, 0.45, 1.0);
      drawCube(island, [0.45, 0.8, 0.35, 1], TEX_GRASS, 1.0);
    }
  }
  let root = new Matrix4();
  root.translate(x, y - 0.7, z);
  root.scale(0.9, 1.0, 0.9);
  drawCube(root, [0.45, 0.25, 0.1, 1], TEX_DIRT, 1.0);
}

function drawAnimatedWater(x, y, z) {
  let M = new Matrix4();
  let wave = 0.04 * Math.sin(g_seconds * 4.0 + x + z);
  M.translate(x, y + wave, z);
  M.scale(1.0, 0.12, 1.0);
  drawCube(M, [0.15, 0.45, 1.0, 0.75], TEX_WATER, 0.9);
}

function drawBeacon(x, y, z) {
  let pulse = 0.2 + 0.15 * Math.sin(g_seconds * 5.0);
  let B = new Matrix4();
  B.translate(x, y, z);
  B.rotate(g_seconds * 65, 0, 1, 0);
  B.scale(0.45 + pulse, 1.7, 0.45 + pulse);
  drawCube(B, [0.3, 1.0, 0.25, 1], TEX_LEAVES, 0.25);
}

function drawCrystalAt(x, y, z, index) {
  let pulse = 0.15 * Math.sin(g_seconds * 5 + index);

  let C = new Matrix4();
  C.translate(x, y + pulse, z);
  C.rotate(g_seconds * 80, 0, 1, 0);
  C.rotate(45, 1, 0, 1);
  C.scale(0.55, 0.55, 0.55);
  drawCube(C, [0.25, 1.0, 0.15, 1], TEX_LEAVES, 0.35);

  let glow = new Matrix4();
  glow.translate(x, y + pulse, z);
  glow.rotate(g_seconds * -55, 0, 1, 0);
  glow.scale(0.95, 0.95, 0.95);
  drawSphere(glow, [0.7, 1.0, 0.3, 0.55], -1, 0.0);
}

function drawCrystals() {
  for (let i = 0; i < g_crystals.length; i++) {
    let c = g_crystals[i];
    if (!c.collected) drawCrystalAt(c.x, c.y, c.z, i);
  }
}

function drawKoalaGrove() {
  for (let i = 0; i < g_collectedCrystals; i++) {
    let angle = (Math.PI * 2 * i) / Math.max(1, g_totalCrystals);
    let px = 24 + Math.cos(angle) * 3.2;
    let pz = 24 + Math.sin(angle) * 3.2;
    let shield = new Matrix4();
    shield.translate(px, 0.25 + 0.08 * Math.sin(g_seconds * 4 + i), pz);
    shield.scale(0.55, 1.1, 0.55);
    drawCube(shield, [0.2, 1.0, 0.35, 1], TEX_LEAVES, 0.6);
  }

  let K = new Matrix4();
  K.translate(24, 0.2, 24);
  K.rotate(180, 0, 1, 0);
  K.scale(0.75, 0.75, 0.75);
  drawKoala(K);

  let baby1 = new Matrix4();
  baby1.translate(22.2, 0.1, 24.4);
  baby1.rotate(135,0,1,0);
  baby1.scale(0.38,0.38,0.38);
  drawKoala(baby1);

  let baby2 = new Matrix4();
  baby2.translate(26.0, 0.1, 23.1);
  baby2.rotate(220,0,1,0);
  baby2.scale(0.34,0.34,0.34);
  drawKoala(baby2);

  if (g_gameWon) {
    for (let i = 0; i < 8; i++) {
      let angle = (Math.PI * 2 * i) / 8 + g_seconds * 0.7;
      let win = new Matrix4();
      win.translate(24 + Math.cos(angle) * 4.4, 2.2 + Math.sin(g_seconds * 3 + i) * 0.25, 24 + Math.sin(angle) * 4.4);
      win.rotate(g_seconds * 90, 0, 1, 0);
      win.scale(0.35, 0.35, 0.35);
      drawCube(win, [1.0, 0.9, 0.2, 1], TEX_LEAVES, 0.25);
    }
  }
}

function checkCrystalCollection() {
  for (let i = 0; i < g_crystals.length; i++) {
    let c = g_crystals[i];
    if (c.collected) continue;

    let dx = camera.eye.elements[0] - c.x;
    let dy = camera.eye.elements[1] - c.y;
    let dz = camera.eye.elements[2] - c.z;
    let dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

    if (dist < 1.5) {
      c.collected = true;
      g_collectedCrystals++;
      g_lastStoryMessage = "Collected crystal " + g_collectedCrystals + "/" + g_totalCrystals + ". Return them to the Koala Grove!";
    }
  }

  let gx = camera.eye.elements[0] - 24;
  let gz = camera.eye.elements[2] - 24;

  if (!g_gameWon && g_collectedCrystals === g_totalCrystals && Math.sqrt(gx*gx + gz*gz) < 4.2) {
    g_gameWon = true;
    g_lastStoryMessage = "You restored the Life Tree. The Koala Grove is protected!";
  }
}

function updateHUD() {
  let fpsLine = "FPS: " + Math.round(g_fps) + " | Textures: " + g_texturesLoaded + "/" + g_totalTextures;
  fpsLine += " | Crystals: " + g_collectedCrystals + "/" + g_totalCrystals;
  fpsLine += " | Lighting: " + (g_useLighting ? "ON" : "OFF");
  fpsLine += " | Normals: " + (g_showNormals ? "ON" : "OFF");
  if (g_gameWon) fpsLine += " | GAME COMPLETE";
  document.getElementById("fps").innerText = fpsLine;
  document.getElementById("story").innerText = g_lastStoryMessage;
}

function getFrontCell() {
  let f = camera.forwardVector();
  let x = Math.round(camera.eye.elements[0] + f.elements[0] * 2.0);
  let z = Math.round(camera.eye.elements[2] + f.elements[2] * 2.0);
  x = Math.max(1, Math.min(46, x));
  z = Math.max(1, Math.min(46, z));
  return {x, z};
}

function addBlockInFront() {
  let c = getFrontCell();
  if (g_map[c.x][c.z] >= 0 && g_map[c.x][c.z] < 4) g_map[c.x][c.z]++;
}

function removeBlockInFront() {
  let c = getFrontCell();
  if (g_map[c.x][c.z] > 0 && g_map[c.x][c.z] < 10) g_map[c.x][c.z]--;
}

function updateAnimationAngles() {
  if (gAnimation) {
    gLeftLegAngle = 15 * Math.sin(g_seconds * 3);
    gRightLegAngle = -15 * Math.sin(g_seconds * 3);
    gLeftArmAngle = -18 * Math.sin(g_seconds * 3);
    gRightArmAngle = 18 * Math.sin(g_seconds * 3);
    gEarAngle = 6 * Math.sin(g_seconds * 4);
  }

  if (gPokeAnimation) {
    let t = g_seconds - gPokeStartTime;
    if (t < 1.2) gExplodeAmount = t / 1.2;
    else if (t < 4.2) gExplodeAmount = 1;
    else if (t < 5.4) gExplodeAmount = 1 - ((t - 4.2) / 1.2);
    else {
      gExplodeAmount = 0;
      gPokeAnimation = false;
    }
  }
}

function updateLightAnimation() {
  if (g_animatePointLight) {
    g_lightPos[0] = 24 + 11 * Math.cos(g_seconds * 0.8);
    g_lightPos[1] = 6.5 + 2 * Math.sin(g_seconds * 1.3);
    g_lightPos[2] = 24 + 11 * Math.sin(g_seconds * 0.8);
  }
}

function setLightingUniforms() {
  gl.uniform3f(u_CameraPos, camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2]);
  gl.uniform3f(u_LightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform3f(u_LightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2]);

  // Spotlight acts like a flashlight attached to the camera.
  let f = camera.forwardVector();
  gl.uniform3f(u_SpotLightPos, camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2]);
  gl.uniform3f(u_SpotLightDir, f.elements[0], f.elements[1], f.elements[2]);

  gl.uniform1i(u_UseLighting, g_useLighting ? 1 : 0);
  gl.uniform1i(u_ShowNormals, g_showNormals ? 1 : 0);
  gl.uniform1i(u_PointLightOn, g_pointLightOn ? 1 : 0);
  gl.uniform1i(u_SpotLightOn, g_spotLightOn ? 1 : 0);
}

function tick() {
  let now = performance.now();
  g_seconds = now / 1000.0 - g_startTime;
  g_fps = 1000 / Math.max(1, now - g_lastFrameTime);
  g_lastFrameTime = now;

  handleMovement();
  updateLightAnimation();
  checkCrystalCollection();
  updateHUD();
  updateAnimationAngles();
  renderScene();
  requestAnimationFrame(tick);
}

function renderScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMatrix.elements);

  let globalRot = new Matrix4();
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRot.elements);

  setLightingUniforms();
  drawWorld();
}
