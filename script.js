// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // sky blue

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  500
);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
scene.add(hemiLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);
scene.add(new THREE.AmbientLight(0x404040, 1.5));

// Load textures
const loader = new THREE.TextureLoader();
const roadTexture = loader.load('asphalt.jpg');
roadTexture.wrapS = roadTexture.wrapT = THREE.RepeatWrapping;
roadTexture.repeat.set(10, 50);

const grassTexture = loader.load('grass.jpg');
grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(20, 20);

// Road
const roadWidth = 10;
const roadLength = 200;
const roadGeometry = new THREE.PlaneGeometry(roadWidth, roadLength);
const roadMaterial = new THREE.MeshPhongMaterial({ map: roadTexture });
const road = new THREE.Mesh(roadGeometry, roadMaterial);
road.rotation.x = -Math.PI / 2;
scene.add(road);

// Grass
const grassGeometry = new THREE.PlaneGeometry(400, 400);
const grassMaterial = new THREE.MeshPhongMaterial({ map: grassTexture });
const grass = new THREE.Mesh(grassGeometry, grassMaterial);
grass.rotation.x = -Math.PI / 2;
grass.position.y = -0.01;
scene.add(grass);

// Yellow divider lines
for (let i = -roadLength/2 + 2; i < roadLength/2; i += 10) {
  const lineGeometry = new THREE.PlaneGeometry(0.3, 4);
  const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
  const line = new THREE.Mesh(lineGeometry, lineMaterial);
  line.rotation.x = -Math.PI / 2;
  line.position.set(0, 0.02, i); // slightly above road
  scene.add(line);
}

// Car loader
let car;
const carLoader = new THREE.GLTFLoader();
carLoader.load("car.glb", function (gltf) {
  car = gltf.scene;
  car.scale.set(0.1, 0.1, 0.1);
  car.position.set(0, 0.05, -roadLength/2 + 5);
  car.rotation.y = Math.PI;
  scene.add(car);
});

// Camera start position
camera.position.set(0, 5, -roadLength/2 + 15);

// Controls
let speed = 0;
let angle = 0;
const keys = {};
document.addEventListener("keydown", (e) => (keys[e.key] = true));
document.addEventListener("keyup", (e) => (keys[e.key] = false));

// Animate
function animate() {
  requestAnimationFrame(animate);

  if (car) {
    if (keys["ArrowUp"] || keys["w"]) speed += 0.002;
    if (keys["ArrowDown"] || keys["s"]) speed -= 0.002;
    speed *= 0.98;

    if (keys["ArrowLeft"] || keys["a"]) angle += 0.03;
    if (keys["ArrowRight"] || keys["d"]) angle -= 0.03;

    car.rotation.y = angle;
    car.position.x += Math.sin(angle) * speed;
    car.position.z += Math.cos(angle) * speed;

    // Keep car on road
    if (car.position.x > roadWidth/2 - 0.5) car.position.x = roadWidth/2 - 0.5;
    if (car.position.x < -roadWidth/2 + 0.5) car.position.x = -roadWidth/2 + 0.5;

    // Camera follow
    camera.position.x = car.position.x - Math.sin(angle) * 8;
    camera.position.z = car.position.z - Math.cos(angle) * 8;
    camera.position.y = 4;
    camera.lookAt(car.position);
  }

  renderer.render(scene, camera);
}
animate();

// Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
