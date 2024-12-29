import * as THREE from 'three';
import { Physics } from './systems/physics.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { Inputs } from './systems/inputs.js'
import { Player } from './systems/player.js';
import { Graphics } from './systems/graphics.js';
import { World } from './systems/world.js';
import { Time } from './systems/time.js';
import { LODModels } from './systems/models.js';
import { GLTFLoader } from './imports/three/examples/jsm/Addons.js';
import { Grid } from './systems/grid.js';
import { Weather } from './systems/weather.js';
import { ParticleEffects } from './systems/particle-effects.js';
import { Builder } from './systems/builder.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.05, 1000);
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
export const models = new LODModels();
export const grid = new Grid();
export const particleEffects = new ParticleEffects()
export const weather = new Weather();

async function main() {
    await models.loadAllModels();

    const physics = new Physics(scene);
    const graphics = new Graphics(scene);

    const player = new Player(camera);
    physics.addRigidBody(player);
    scene.add(player)

    await player.loadModel(scene)
    
    const world = new World(physics, player);
    scene.add(world);

    const builder = new Builder(camera, world, player);

    scene.add(particleEffects);
    scene.add(player.skin);


    const loader = new GLTFLoader();

    /*
    let mixer = null;
    let actions = {}
    loader.load("models/animals/cow.glb", gltf => {
        const cow = gltf.scene;
        cow.scale.setScalar(0.5);

        cow.traverse(obj => {
            if (obj.isMesh) {
                obj.material = new THREE.MeshLambertMaterial({
                    color: obj.material.color,
                    map: obj.material.map,
                    transparent: obj.material.transparent,
                    opacity: obj.material.opacity,
                    side: obj.material.side,
                    emissive: obj.material.emissive,
                    emissiveMap: obj.material.emissiveMap,
                    emissiveIntensity: obj.material.emissiveIntensity,
                    envMap: obj.material.envMap,
                    name: obj.material.name
                })
            }
        })

        mixer = new THREE.AnimationMixer(cow);

        gltf.animations.forEach((clip) => {
            actions[clip.name] = mixer.clipAction(clip);
        });

        console.log(actions);
        actions['Walk'].play();

        scene.add(cow);
    })

    */





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
                builder.getIntersection()
                break;
            case 'k':
                
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
        weather.update();
        if (world.initialized) physics.update(dt);
        graphics.update(time.getDelta(), player);
        world.update(time.getDelta());
        particleEffects.update();

        // Update FPS every second
        
        frameCount++;
        if (newTime - lastFpsTime >= 1000) { // 1000ms = 1 second
            fps = frameCount;
            frameCount = 0;
            lastFpsTime = newTime;
            //console.log("FPS: ", fps);
        }


        //if (mixer) mixer.update(dt);



        


        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

}

main();