import * as THREE from 'three';
import { GLTFLoader } from '../imports/three/examples/jsm/Addons.js';
import { SimplifyModifier } from '../imports/three/examples/jsm/Addons.js';
import { LODModelsData, modelsData } from '../data/models.js';



const modifier = new SimplifyModifier()
const manager = new THREE.LoadingManager();
const LODloader = new GLTFLoader(manager).setPath('models/nature/')
const loader = new GLTFLoader(manager);

export class LODModels {
    constructor() {
        this.models = {};
    }

    loadModel(name, geometry = 1, LOD) {
        return new Promise((resolve, reject) => {
            LODloader.load(LODModelsData[name].path + name + '.glb', gltf => {
                const model = gltf.scene;
                const subModels = [];
                model.traverse(obj => {
                    if (obj.isMesh && obj.material) {
                        if (geometry < 1 && geometry > 0 && obj.geometry){ 
                            obj.geometry = modifier.modify(obj.geometry, Math.floor(obj.geometry.attributes.position.count * geometry))
                        };
                        obj.castShadow = true;
                        obj.receiveShadow = true;
                        
                        
                        if ((obj.material instanceof THREE.MeshStandardMaterial)) {
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
                            });
                        }
                            
                        
                        obj.userData.updatedSeasonLook = false;
                        
                        subModels.push(obj);
                    }
                })
                this.models[name + '_' + LOD] = subModels;
                resolve(gltf);
            }, undefined, (error) => reject(error));
        })
    }

    async loadAllModels() {
        try {
            const elements = [];
            for (const name in LODModelsData) {
                for (const level in LODModelsData[name].LOD) {
                    if (LODModelsData[name].LOD[level].geometry == 0) continue; //if it has 100% geometry reduction
                    elements.push({name: name, LOD: LODModelsData[name].LOD[level].geometry, level: level});
                }
            }
            await Promise.all(
                elements.map(model => this.loadModel(model.name, model.LOD, model.level))
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






export class Models {
    constructor () {
        this.models = {}
    }

    loadModel(path) {
        return new Promise((resolve, reject) => {
            loader.load("models/" + path + ".glb", (gltf) => {
                const model = gltf.scene;

                model.traverse(obj => {
                    if (obj.isMesh) {
                        obj.castShadow = true;
                        obj.recieveShadow = true;
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
                        });
                    }
                })
                const name = path.split("/")[1];
                this.models[name] = model;
                resolve(gltf)
            }, undefined, (error) => reject(error));
        })
    }

    async loadAllModels() {
        try {
            const elements = [];
            for (const path in modelsData) {
                for (const name in modelsData[path]) {
                    elements.push(path + "/" + name);
                }
            }
            await Promise.all(
                elements.map(element => this.loadModel(element))
            );
        } catch (error) {
            console.error('Error loading models: ', error);
        }
    }

    getModel(name) {
        const model = this.models[name];
        if (!model) return null;
        return model.clone();
    }
}