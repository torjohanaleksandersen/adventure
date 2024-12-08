import * as THREE from 'three';
import { Physics } from './systems/physics.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { Inputs } from './systems/inputs.js'
import { Player } from './systems/player.js';
import { Graphics } from './systems/graphics.js';
import { World } from './systems/world.js';
import { Time } from './systems/time.js';
import { Models } from './systems/models.js';
import { GLTFLoader } from './imports/three/examples/jsm/Addons.js';
import { Grid } from './systems/grid.js';
import { FBXLoader } from './imports/FBXLoader/FBXLoader.js';
import { Animator } from './systems/animator.js';
import { Weather } from './systems/weather.js';
import { Water } from './imports/three/examples/jsm/objects/Water2.js';
import { ParticleEffects } from './systems/particle-effects.js';

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
controls.pointerSpeed = 0.5
document.addEventListener('mousedown', () => {
    controls.lock();
})

export const inputs = new Inputs(camera, renderer)
export const time = new Time();
export const models = new Models();
export const grid = new Grid();
export const weather = new Weather();

async function main() {
    await models.loadAllModels();

    const physics = new Physics(scene);
    const graphics = new Graphics(scene);

    const player = new Player(camera);
    physics.addRigidBody(player);
    scene.add(player)

    //await player.loadModel(scene)
    
    const world = new World(physics, player);
    scene.add(world);

    const particleEffects = new ParticleEffects()
    scene.add(particleEffects);
    
    scene.add(player.skin);


    inputs.registerHandler('keydown', (e) => {
        switch(e.key) {
            case 'g':
                console.log(weather.getTemperature());
                break;
            case 'h':
                world.chunks.forEach(chunk => {
                    chunk.updateSeasonalColors();
                })
                break;
            case 'j': 
                weather.set('snow')
                break;
            case 'k':
                weather.set('clear');
                break;
        }
    })



    let currentTime = performance.now();
    let lastFpsTime = performance.now();
    let frameCount = 0;
    let fps = 0;

    render();

    function render() {
        const newTime = performance.now();
        const dt = (newTime - currentTime) / 1000;
        currentTime = newTime;
        time.update(dt);
        weather.update(player.position, particleEffects);
        if (world.initialized) physics.update(dt);
        graphics.update(dt, player);
        world.update(dt);
        particleEffects.update();

        // Update FPS every second
        /*
        frameCount++;
        if (newTime - lastFpsTime >= 1000) { // 1000ms = 1 second
            fps = frameCount;
            frameCount = 0;
            lastFpsTime = newTime;
        }
        */


        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

}

main();