import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050713, 0.018);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(14, 9, 18);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 2, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 70;
controls.update();

const loadingManager = new THREE.LoadingManager();
loadingManager.onLoad = () => {
  document.getElementById('status').textContent = '';
};

const textureLoader = new THREE.TextureLoader(loadingManager);

// Textured skybox using a cubemap texture.
const cubeLoader = new THREE.CubeTextureLoader(loadingManager);
scene.background = cubeLoader.load([
  'assets/skybox/px.png',
  'assets/skybox/nx.png',
  'assets/skybox/py.png',
  'assets/skybox/ny.png',
  'assets/skybox/pz.png',
  'assets/skybox/nz.png'
]);

// Textured primary shape: the lunar base floor.
const floorTexture = textureLoader.load('assets/textures/metal_floor.png');
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(12, 12);
floorTexture.colorSpace = THREE.SRGBColorSpace;

const floor = new THREE.Mesh(
  new THREE.BoxGeometry(42, 0.35, 42),
  new THREE.MeshStandardMaterial({ map: floorTexture, roughness: 0.7, metalness: 0.25 })
);
floor.position.y = -0.2;
floor.receiveShadow = true;
scene.add(floor);

// At least 3 different light sources: ambient, hemisphere, directional, point, and spot.
const ambientLight = new THREE.AmbientLight(0xffffff, 0.22);
scene.add(ambientLight);

const hemisphereLight = new THREE.HemisphereLight(0x99bbff, 0x222244, 0.55);
scene.add(hemisphereLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.1);
directionalLight.position.set(8, 16, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(2048, 2048);
directionalLight.shadow.camera.left = -30;
directionalLight.shadow.camera.right = 30;
directionalLight.shadow.camera.top = 30;
directionalLight.shadow.camera.bottom = -30;
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0x55ccff, 1.7, 24);
pointLight.position.set(-7, 5, -6);
pointLight.castShadow = true;
scene.add(pointLight);

const spotLight = new THREE.SpotLight(0xffffff, 1.5, 40, Math.PI / 7, 0.35, 1.2);
spotLight.position.set(9, 13, -10);
spotLight.target.position.set(0, 0, 0);
spotLight.castShadow = true;
scene.add(spotLight);
scene.add(spotLight.target);

const animatedObjects = [];
const crystalObjects = [];
const droneGroup = new THREE.Group();
scene.add(droneGroup);

function makeMaterial(color, options = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.15, ...options });
}

function addMesh(mesh, cast = true, receive = true) {
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  scene.add(mesh);
  return mesh;
}

// Primary shapes count: many cubes, spheres, cylinders, cones, torus objects.
// Research buildings: cubes/boxes.
const buildingMat = makeMaterial(0x8f9ca8, { metalness: 0.35 });
for (let i = 0; i < 8; i++) {
  const x = -14 + i * 4;
  const z = i % 2 === 0 ? -8 : -12;
  const height = 1.5 + (i % 3) * 0.8;
  const building = new THREE.Mesh(new THREE.BoxGeometry(2.4, height, 2.4), buildingMat);
  building.position.set(x, height / 2, z);
  addMesh(building);
}

// Cylindrical fuel tanks.
const tankMat = makeMaterial(0xb7bec7, { metalness: 0.5, roughness: 0.35 });
for (let i = 0; i < 6; i++) {
  const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 2.6, 32), tankMat);
  tank.position.set(-13 + i * 2.2, 1.3, 8);
  addMesh(tank);
}

// Spherical radar domes.
const domeMat = makeMaterial(0x88ccff, { transparent: true, opacity: 0.78, metalness: 0.1 });
for (let i = 0; i < 5; i++) {
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.85, 32, 16), domeMat);
  dome.position.set(-10 + i * 5, 0.9, 12);
  addMesh(dome);
}

// Antenna towers using cylinders and cones.
const antennaMat = makeMaterial(0xdddddd, { metalness: 0.6 });
for (let i = 0; i < 4; i++) {
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 5, 16), antennaMat);
  tower.position.set(-15 + i * 10, 2.5, 0);
  addMesh(tower);

  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.75, 1.2, 24), makeMaterial(0xffcc55, { emissive: 0x332200 }));
  cone.position.set(-15 + i * 10, 5.6, 0);
  addMesh(cone);
  animatedObjects.push(cone);
}

// Textured animated energy crystals for the Wow Point.
const crystalTexture = textureLoader.load('assets/textures/crystal_texture.png');
crystalTexture.colorSpace = THREE.SRGBColorSpace;
const crystalMat = new THREE.MeshStandardMaterial({
  map: crystalTexture,
  color: 0x55eaff,
  emissive: 0x006688,
  emissiveIntensity: 1.25,
  roughness: 0.2,
  metalness: 0.1
});
for (let i = 0; i < 7; i++) {
  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.8, 0), crystalMat.clone());
  const angle = (i / 7) * Math.PI * 2;
  crystal.position.set(Math.cos(angle) * 7, 1.3, Math.sin(angle) * 7);
  crystal.castShadow = true;
  scene.add(crystal);
  crystalObjects.push(crystal);
  animatedObjects.push(crystal);

  const glow = new THREE.PointLight(0x00ddff, 0.45, 7);
  crystal.add(glow);
}

// Orbiting drones: spheres + torus rings.
for (let i = 0; i < 4; i++) {
  const drone = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.38, 24, 16), makeMaterial(0xffdd66, { emissive: 0x221100 }));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.045, 8, 32), makeMaterial(0xffffff, { metalness: 0.4 }));
  body.castShadow = true;
  ring.castShadow = true;
  drone.add(body, ring);
  const angle = (i / 4) * Math.PI * 2;
  drone.position.set(Math.cos(angle) * 11, 4.5, Math.sin(angle) * 11);
  drone.userData.angle = angle;
  drone.userData.radius = 11;
  droneGroup.add(drone);
}

// Central landing pad.
const pad = new THREE.Mesh(
  new THREE.CylinderGeometry(4.2, 4.2, 0.22, 64),
  makeMaterial(0x333944, { metalness: 0.4, roughness: 0.45 })
);
pad.position.set(0, 0.02, 0);
addMesh(pad);

const padRing = new THREE.Mesh(
  new THREE.TorusGeometry(4.35, 0.08, 12, 80),
  makeMaterial(0x00aaff, { emissive: 0x003344, emissiveIntensity: 1.1 })
);
padRing.rotation.x = Math.PI / 2;
padRing.position.y = 0.18;
addMesh(padRing);
animatedObjects.push(padRing);

// Custom textured 3D model loaded from local glTF file.
const gltfLoader = new GLTFLoader(loadingManager);
gltfLoader.load(
  'assets/models/ufo.gltf',
  (gltf) => {
    const ufo = gltf.scene;
    ufo.name = 'Custom textured UFO glTF model';
    ufo.position.set(0, 1.2, 0);
    ufo.scale.set(1.6, 1.6, 1.6);
    ufo.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(ufo);
    animatedObjects.push(ufo);
  },
  undefined,
  (error) => {
    document.getElementById('status').textContent = 'Model failed to load. Check assets/models/ufo.gltf path.';
    console.error(error);
  }
);

// Extra terrain rocks to make the world feel full.
const rockMat = makeMaterial(0x555866, { roughness: 0.9 });
for (let i = 0; i < 18; i++) {
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35 + Math.random() * 0.5, 0), rockMat);
  rock.position.set((Math.random() - 0.5) * 36, 0.25, (Math.random() - 0.5) * 36);
  rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  rock.scale.y = 0.45 + Math.random() * 0.7;
  addMesh(rock);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();

  for (const obj of animatedObjects) {
    obj.rotation.y += 0.01;
  }

  crystalObjects.forEach((crystal, i) => {
    crystal.position.y = 1.3 + Math.sin(elapsed * 2 + i) * 0.25;
    crystal.material.emissiveIntensity = 0.9 + Math.sin(elapsed * 3 + i) * 0.35;
  });

  droneGroup.children.forEach((drone, i) => {
    const angle = elapsed * 0.45 + drone.userData.angle;
    drone.position.x = Math.cos(angle) * drone.userData.radius;
    drone.position.z = Math.sin(angle) * drone.userData.radius;
    drone.position.y = 4.4 + Math.sin(elapsed * 1.7 + i) * 0.45;
    drone.rotation.y += 0.04;
  });

  pointLight.position.x = Math.sin(elapsed) * 8;
  pointLight.position.z = Math.cos(elapsed) * 8;

  controls.update();
  renderer.render(scene, camera);
}

animate();
