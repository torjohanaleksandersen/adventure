import * as THREE from 'three';
import { Physics } from './systems/physics.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { Inputs } from './systems/inputs.js'
import { Player } from './systems/player.js';
import { createNoise2D } from './imports/simplex-noise/dist/esm/simplex-noise.js';
import { Sky } from './imports/three/examples/jsm/Addons.js';
import { MathUtils } from './imports/MathUtils.js'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(new THREE.Color(1, 1, 1))
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild( renderer.domElement );

const light = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(light);

// Create the directional light and set its properties
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
const directionalLightPosition = new THREE.Vector3(0, 0.5, -1).multiplyScalar(100);
directionalLight.position.copy(directionalLightPosition);
directionalLight.castShadow = true;

// Set up shadow camera for better quality
const d = 50;
directionalLight.shadow.camera.left = -d;
directionalLight.shadow.camera.right = d;
directionalLight.shadow.camera.top = d;
directionalLight.shadow.camera.bottom = -d;
directionalLight.shadow.camera.near = 100;
directionalLight.shadow.camera.far = 400;
directionalLight.shadow.bias = -0.01
directionalLight.shadow.mapSIze = new THREE.Vector2(1024, 1024);

// Add the directional light and its target to the scene
scene.add(directionalLight);
scene.add(directionalLight.target);

// Add a helper to visualize the light direction
const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);

// Optionally, you can also add the shadow camera helper for debugging purposes
const shadowCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);


scene.fog = new THREE.Fog(0xD7D0FF, 400, 500);

const sky = new Sky();
sky.scale.setScalar( 450000 );
sky.material.uniforms.turbidity.value = 0.5;
sky.material.uniforms.mieDirectionalG = 0;


const phi = MathUtils.degToRad( 90 );
const theta = MathUtils.degToRad( 180 );
const sunPosition = new THREE.Vector3().setFromSphericalCoords( 1, phi, theta );

sky.material.uniforms.sunPosition.value = sunPosition;

scene.add( sky );

const controls = new PointerLockControls(camera, renderer.domElement);
document.addEventListener('mousedown', () => {
    controls.lock();
})

export const inputs = new Inputs(camera, renderer)


const physics = new Physics(scene);


const player = new Player(camera, scene);
physics.addRigidBody(player);



const green = [
    0x11330e, // Base color
    0x0f2e0c, // Darker, less red
    0x0e2f0e, // Slightly more green
    0x12330d, // Slightly brighter
    0x10320f, // A bit more blue
    0x0f330d, // Slightly less green
    0x12310f, // Redder shade
    0x0e2d0f, // A bit lighter
    0x0d2f10, // Darker, more neutral
    0x13330f, // Slightly richer
];


const sand = [
    0xedf28d, // Base color
    0xe3e182, // Slightly darker, less yellow
    0xf0e88b, // A little brighter, more yellow
    0xe1d684, // More neutral, less saturated
    0xf1e15c, // More golden tone
    0xf0d87a, // Slightly darker and more brown
    0xe8d77e, // A bit more muted
    0xd9c56a, // More earthy tone
    0xf4e4a0, // Lighter and warmer
    0xe4d68d, // Slightly richer, more yellow-orange
];

const sandGrassTransitionColors = [
    0x1f4119, // A mix of dark green and light sand
    0x4d5632, // Earthy olive with a hint of warmth
    0x55662b, // Slightly greenish sand
    0x6c763d, // Earthy brown-green blend
    0x736c3f, // Muted green with a hint of yellow
    0x4f5b39, // Balanced olive and light sand
    0x5a5b3b, // More muted green, with sand undertones
    0x8b7d48, // More yellow, leaning towards sand
    0x6e7542, // Olive green with some golden warmth
    0x7f6b4f, // Warm, earthy blend with some greenish tones
];

const stone = [
    0x8a8a8a, // Base stone color
    0x787878, // Slightly darker gray
    0x9b9b9b, // Slightly lighter gray
    0x7f7f7f, // Cooler gray tone
    0x8f8f8f, // A bit warmer gray
    0x6e6e6e, // Darker, more neutral gray
    0x949494, // Lighter gray, still earthy
    0x858585, // Neutral gray, subtle blue tone
    0x929292, // Light, neutral gray
    0x818181, // Darker with a bit of depth
];

const snowColors = [
    0xf0f8ff, // Light snowy white with a hint of blue
    0xe6f2ff, // Very light blue, shadowed snow
    0xf8f9fa, // Almost pure white
    0xfafafa, // Neutral white
    0xeaeaea, // Soft grayish white
    0xdedfe1, // Light gray for shaded snow
    0xd8e4f0, // Icy blue hint
    0xcfd8e1, // Grayish blue
    0xbfc9d6, // Light blue-gray, deep shadow snow
    0xaab4c4  // Slightly darker, cool shadowed snow
];

const grassStoneTransitionColors = [
    0x11330e, // Dark forest green (grass base)
    0x2e4f23, // Earthy green
    0x4a6738, // Faded green with brown hint
    0x6e7e56, // Olive green-brown, beginning to mix with stone
    0x8d8b72, // Greenish-gray, intermediary between grass and stone
    0x8a8a8a, // Light stone gray, blending into rock
    0x787878, // Mid-gray, primary stone color
    0x656565, // Dark gray, shadowed stone
    0x505050, // Deep gray with slight green undertone for mossy stone
    0x3d3d3d  // Dark rock gray, fully stone area
];

const f1 = createNoise2D(); // Main layer
const f2 = createNoise2D(); // terrain bumps 1
const f3 = createNoise2D(); // terrain bumps 2
const f4 = createNoise2D(); // mountain
const f5 = createNoise2D(); // mountain bumps

function getHeight(x, z) {
    const base = f1(x, z);
    const bump1 = f2(x* 10, z* 10) * 0.1;
    const bump2 = f3(x * 2, z * 2) * 0.1;
    let mountains = Math.pow(f4(x * 0.6, z * 0.6), 8) * 8;
    const mountainBumps = f5(x * 10, z * 10) * 0.6;
    if (mountains > 2) mountains += mountainBumps;

    //base + bump1 + bump2 + mountains
    return base + bump1 + bump2 + mountains
}




// Create a custom geometry for a 10x10 plane mesh with a flat color for each triangle
const geometry = new THREE.BufferGeometry();
const vertices = [];
const colors = [];

// Plane settings
const gridSize = 500;
const planeSize = 500;

const triangleSize = planeSize / gridSize;

const heightMap = [];
for (let x = 0; x <= gridSize; x++) {
    heightMap[x] = [];
    for (let z = 0; z <= gridSize; z++) {
        const frequency = 0.02;
        const amplitude = 3;
        heightMap[x][z] = getHeight(x * frequency, z * frequency) * amplitude;
    }
}

function getColor(type) {
    if (type === 'grass') {
      return green[Math.floor(Math.random() * green.length)]
    } else if (type === 'sand') {
      return sand[Math.floor(Math.random() * sand.length)]
    } else if (type == 'stone') {
        return stone[Math.floor(Math.random() * stone.length)]
    } else if (type == 'mix_sand-grass') {
        return sandGrassTransitionColors[Math.floor(Math.random() * sandGrassTransitionColors.length)]
    } else if (type == 'snow') {
        return snowColors[Math.floor(Math.random() * snowColors.length)]
    } else if (type == 'mix_grass-stone') {
        return grassStoneTransitionColors[Math.floor(Math.random() * grassStoneTransitionColors.length)]
    }
}

//adding water
const waterGeometry = new THREE.PlaneGeometry(planeSize, planeSize, gridSize, gridSize);
const waterMaterial = new THREE.MeshLambertMaterial({color: 0x003482, side: THREE.DoubleSide, flatShading: true, transparent: true, opacity: 0.5});
const waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
waterMesh.receiveShadow = true;
waterMesh.rotation.x = - Math.PI / 2;
scene.add(waterMesh);
  

for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
        // Get the random heights from the height map for each corner of the square
        const h1 = heightMap[i][j];
        const h2 = heightMap[i + 1][j];
        const h3 = heightMap[i][j + 1];
        const h4 = heightMap[i + 1][j + 1];

        const h_1 = (h1 + h2 + h3) / 3;
        const h_2 = (h2 + h3 + h4) / 3

        const grassLevel = 0.5 + (Math.random() * 0.02 - 0.01);
        const mountainLevel = 5 + (Math.random() * 0.5 - 1);
        const snowlevel = 10 + (Math.random() * 0.5 - 1);

        let color1 = new THREE.Color();
        let color2 = new THREE.Color();

        if (h_1 > snowlevel) {
            color1.setHex(getColor('snow'))
        } else if (h_1 > mountainLevel) {
            color1.setHex(getColor('stone'))
        } else if (h_1 > mountainLevel - 1) {
            color1.setHex(getColor('mix_grass-stone'))
        } else if (h_1 > grassLevel) {
            color1.setHex(getColor('grass'));
        } else if (h_1 > grassLevel - 0.2) {
            color1.setHex(getColor('mix_sand-grass'))
        } else {
            color1.setHex(getColor('sand'));
        }

        if (h_2 > snowlevel) {
            color2.setHex(getColor('snow'))
        } else if (h_2 > mountainLevel) {
            color2.setHex(getColor('stone'))
        } else if (h_2 > mountainLevel - 1) {
            color2.setHex(getColor('mix_grass-stone'))
        } else if (h_2 > grassLevel) {
            color2.setHex(getColor('grass'));
        } else if (h_2 > grassLevel - 0.2) {
            color2.setHex(getColor('mix_sand-grass'))
        } else {
            color2.setHex(getColor('sand'));
        }

        const x = (i * triangleSize) - (planeSize / 2);
        const z = (j * triangleSize) - (planeSize / 2);

        // Triangle 1 of each grid square
        vertices.push(x, z, h1);
        vertices.push(x + triangleSize, z, h2);
        vertices.push(x, z + triangleSize, h3);

        colors.push(color1.r, color1.g, color1.b);
        colors.push(color1.r, color1.g, color1.b);
        colors.push(color1.r, color1.g, color1.b);

        // Triangle 2 of each grid square
        vertices.push(x + triangleSize, z, h2);
        vertices.push(x + triangleSize, z + triangleSize, h4);
        vertices.push(x, z + triangleSize, h3);

        colors.push(color2.r, color2.g, color2.b);
        colors.push(color2.r, color2.g, color2.b);
        colors.push(color2.r, color2.g, color2.b);
    }
}

// Add vertices and colors to geometry
geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

// Create material with flat shading and vertex colors
const material = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
const mesh = new THREE.Mesh(geometry, material);
mesh.rotation.x = - Math.PI / 2;
mesh.castShadow = true;
mesh.receiveShadow = true;
scene.add(mesh);
physics.addMeshCollider(mesh)

physics.finalizeEnvironmentColliders()


let timeElapsed = 0;

function updateWaves(dt) {
    timeElapsed += dt;
    const position = waterMesh.geometry.attributes.position;

    for (let i = 0; i < position.count; i++) {
        const x = position.array[i * 3];
        const z = position.array[i * 3 + 1];

        const y = Math.sin(x + timeElapsed) + Math.cos(z + timeElapsed);
        position.array[i * 3 + 2] = y * 0.1;
    }
    position.needsUpdate = true;
}








let time = performance.now();
let cycleTime = -60
render();
function render() {
    const newTime = performance.now();
    const dt = (newTime - time) / 1000;
    time = newTime;

    physics.update(dt)
    updateWaves(dt)

    if (cycleTime > 270) cycleTime = -90;
    const phi = MathUtils.degToRad( cycleTime += 0.01 );
    const theta = MathUtils.degToRad( 180 );
    const sunPosition = new THREE.Vector3().setFromSphericalCoords( 1, phi, theta );

    directionalLight.position.copy(player.position);
    directionalLight.position.add(sunPosition.clone().multiplyScalar(100));
    directionalLight.target.position.copy(player.position);


    if (cycleTime > 90 && cycleTime < 270) {
        let value = cycleTime - 90;

        if (value > 90) value = 90 - (value - 90);
        value /= 90;

    }

    sky.material.uniforms.sunPosition.value = sunPosition;


    renderer.render(scene, camera);
    requestAnimationFrame(render);
}