import * as THREE from 'three';
import { Physics } from './systems/physics.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { Inputs } from './systems/inputs.js'
import { Player } from './systems/player.js';
import { Graphics } from './systems/graphics.js';
import { World } from './systems/world.js';
import { Time } from './systems/time.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(new THREE.Color(1, 1, 1))
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild( renderer.domElement );

const controls = new PointerLockControls(camera, renderer.domElement);
document.addEventListener('mousedown', () => {
    controls.lock();
})

export const inputs = new Inputs(camera, renderer)
export const time = new Time()

const physics = new Physics(scene);

const player = new Player(camera, scene);
physics.addRigidBody(player);

const graphics = new Graphics(scene);

const world = new World(physics, player)
scene.add(world)


inputs.registerHandler('keydown', e => {
    if (e.key == 'g') console.log(player.position)
})

let currentTime = performance.now();
render();
function render() {
    const newTime = performance.now();
    const dt = (newTime - currentTime) / 1000;
    currentTime = newTime;
    time.update(dt);



    if (world.initialized) physics.update(dt);
    graphics.update(dt, player);
    world.update(dt)


    renderer.render(scene, camera);
    requestAnimationFrame(render);
}