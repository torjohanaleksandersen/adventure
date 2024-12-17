import * as THREE from 'three';
import { GLTFLoader } from '../imports/three/examples/jsm/Addons.js';

const loader = new GLTFLoader();


export class Campfire extends THREE.Object3D {
    constructor () {
        super();
        loader.load('models/worldobj/campfire.glb', (gltf) => {
            const model = gltf.scene;

            this.add(model);
        })

        this.scale.setScalar(0.5);
    }
}