import * as THREE from 'three';
import { GLTFLoader } from '../imports/three/examples/jsm/Addons.js';
import { SimplifyModifier } from '../imports/three/examples/jsm/Addons.js';



const models = [
    'Tree0',
    'Tree1',
    'Rock0'
]

const modifier = new SimplifyModifier()
const manager = new THREE.LoadingManager();
const loader = new GLTFLoader(manager).setPath('models/nature/')

export class Models {
    constructor() {
        this.models = {};
    }

    getKey(name, LOD = 1) {
        if (LOD === 1) return `${name}_H`;
        else if (LOD >= 0.5) return `${name}_M`;
        else return `${name}_L`;
    }

    loadModel(name, LOD = 1) {
        return new Promise((resolve, reject) => {
            loader.load(name + '.glb', gltf => {
                const model = gltf.scene;
                const subModels = [];
                model.traverse(obj => {
                    if (obj.isMesh && obj.material) {
                        if (LOD < 1 && LOD > 0 && obj.geometry){ 
                            obj.geometry = modifier.modify(obj.geometry, Math.floor(obj.geometry.attributes.position.count * LOD))
                        };
                        obj.material = obj.material.clone();
                        obj.material.needsUpdate = true;
                        subModels.push(obj);
                    }
                })
                this.models[this.getKey(name, LOD)] = subModels;
                resolve(gltf);
            }, undefined, (error) => reject(error));
        })
    }

    async loadAllModels() {
        try {
            await Promise.all([
                this.loadModel('Tree0'),
                this.loadModel('Tree0', 0.5),
                this.loadModel('Tree0', 0.3),
                this.loadModel('Rock0'),
                this.loadModel('Rock0', 0.5),
            ]);
        } catch (error) {
            console.error('Error loading models: ', error);
        }
    }

    getModel(name) {
        const models = []
        if (!this.models[name]) return models;
        this.models[name].forEach(model => {
            models.push(model.clone());
        })
        return models;
    }
}