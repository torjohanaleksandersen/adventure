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
import { Weather } from './systems/weather.js';
import { ParticleEffects } from './systems/particle-effects.js';
import { Campfire } from './world-objects/campfire.js';
import { Builder } from './systems/builder.js';

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


    const loader = new GLTFLoader();

    loader.load("models/nature/sky/Cloud.glb", gltf => {
        const model = gltf.scene;

        model.scale.setScalar(6)
        model.position.set(0, 50, 50)

        model.traverse(obj => {
            if (obj.isMesh) {
                obj.recieveShadow = false;
                obj.castShadow = false;
                const updatedMaterial = obj.material.clone();

                // Update material properties
                updatedMaterial.roughness = 0.8;
                updatedMaterial.metalness = 0.0;
                updatedMaterial.transparent = true;
                updatedMaterial.opacity = 0.9;

                updatedMaterial.emissive = new THREE.Color(0xffffff); // Lighten the bottom
                updatedMaterial.emissiveIntensity = 0.2;

                // Assign the updated material back to the mesh
                obj.material = updatedMaterial;
            }
        })

        scene.add(model);
    })














    let warm = 0;
    inputs.registerHandler('keydown', (e) => {
        switch(e.key) {
            case 'g':
                console.log(weather.getTemperature() + warm);
                break;
            case 'h':
                world.chunks.forEach(chunk => {
                    chunk.updateSeasonalColors();
                })
                break;
            case 'j': 
                particleEffects.createWeather('rain');
                break;
            case 'k':
                particleEffects.removeWeather('rain');
                break;
        }
    })


    const campfire = new Campfire();
    campfire.position.set(0, 1, 0);
    campfire.visible = false;
    scene.add(campfire);





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
        graphics.update(time.getDelta(), player);
        world.update(time.getDelta());
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

        const distFromCampfire = new THREE.Vector2(
            campfire.position.x - player.position.x,
            campfire.position.z - player.position.z
        ).length();

        warm = 0;
        if (distFromCampfire < 5) {
            warm += (5 - distFromCampfire) * 30;
        }



        


        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

}

main();