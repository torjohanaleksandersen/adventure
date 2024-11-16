import * as THREE from 'three';
import { GLTFLoader } from '../imports/three/examples/jsm/Addons.js';
import { SimplifyModifier } from '../imports/three/examples/jsm/Addons.js';
import { modelData } from '../data/models.js';



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
            loader.load(modelData[name].path + name + '.glb', gltf => {
                const model = gltf.scene;
                const subModels = [];
                model.traverse(obj => {
                    if (obj.isMesh && obj.material) {
                        if (LOD < 1 && LOD > 0 && obj.geometry){ 
                            obj.geometry = modifier.modify(obj.geometry, Math.floor(obj.geometry.attributes.position.count * LOD))
                        };
                        obj.castShadow = true;
                        obj.receiveShadow = true;
                        //obj.material = new THREE.MeshLambertMaterial({color: obj.material.color});
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
            const elements = [];
            for (const name in modelData) {
                for (const level in modelData[name].LOD) {
                    if (modelData[name].LOD[level].geometry == 0) continue; //if it has 100% geometry reduction
                    elements.push({name: name, LOD: modelData[name].LOD[level].geometry});
                }
            }
            await Promise.all(
                elements.map(model => this.loadModel(model.name, model.LOD))
            );
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