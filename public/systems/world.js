import * as THREE from 'three'
import { Chunk } from './chunk.js'
import { time } from '../main.js';
import { GLTFLoader } from '../imports/three/examples/jsm/Addons.js';

const CHUNK_SIZE = 50;
const CHUNK_GRID_SIZE = 50;
const DRAW_RANGE = 3;

export class World extends THREE.Group {
    constructor (physics) {
        super();
        this.physics = physics;
        this.chunks = new Map();
        this.pendingChunksToRigidBodies = new Set();
        this.initialized = false;
        
        for (let x = - DRAW_RANGE + 1; x < DRAW_RANGE; x++) {
            for (let z = - DRAW_RANGE + 1; z < DRAW_RANGE; z++) {
                this.generateChunk(x, z)
            }
        }

        this.addWater()

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshLambertMaterial({color: 0xff8921});
        const mesh = new THREE.Mesh(geometry, material);
    }

    forEachVertex(callback) {
        this.children.forEach(child => {
            if (child.name != 'chunk') return;
    
            const position = child.Collider.geometry.attributes.position;
    
            const worldPosition = new THREE.Vector3();
            child.getWorldPosition(worldPosition);

            for (let i = 0; i < position.count; i++) {
                const x = position.array[i * 3];
                const y = position.array[i * 3 + 2];
                const z = position.array[i * 3 + 1];
    
                callback({
                    x: worldPosition.x + x, 
                    y: worldPosition.y + y, 
                    z: worldPosition.z - z
                });
            }
        });
    }

    generateTree() {
        const loader = new GLTFLoader()

        loader.load("models/nature/Tree0.glb", (gltf) => {
            const model = gltf.scene;

            model.position.set(0, 5, 0)
            model.scale.setScalar(5)

            model.traverse(obj => {
                if (obj.isMesh) {
                    obj.castShadow = true;
                    obj.receiveShadow = true;
                }
            })

            setTimeout(() => {
                this.forEachVertex((vertex) => {
                    if (vertex.y > 1 && vertex.y < 4 && Math.random() >= 0.999) {
                        const clone = model.clone();
                        clone.position.set(vertex.x, vertex.y + 5, vertex.z);
                        this.add(clone);
                    }
                })
            }, 500)
        })
    }

    generateChunk(x, z) {
        const chunk = new Chunk(x, z, CHUNK_SIZE, CHUNK_GRID_SIZE);
        this.chunks.set(`${x},${z}`, chunk);

        chunk.position.set(x * (CHUNK_SIZE), 0, z * (CHUNK_SIZE));
        this.add(chunk);
        this.pendingChunksToRigidBodies.add(chunk);
    }

    addWater() {
        const geometry = new THREE.PlaneGeometry(500, 500, 500, 500);
        const material = new THREE.MeshLambertMaterial({color: 0x003482, side: THREE.DoubleSide, flatShading: true, transparent: true, opacity: 0.5});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = 'water'
        mesh.receiveShadow = true;
        mesh.rotation.x = - Math.PI / 2;
        this.waterMesh = mesh;
        this.add(mesh);
    }

    updateWater(dt) {
        if (!this.waterMesh) return
        const position = this.waterMesh.geometry.attributes.position;

        for (let i = 0; i < position.count; i++) {
            const x = position.array[i * 3];
            const z = position.array[i * 3 + 1];

            const y = Math.sin(x + time.getTime()) + Math.cos(z + time.getTime());
            position.array[i * 3 + 2] = y * 0.08;
        }
        position.needsUpdate = true;
    }

    update(dt) {

        this.updateWater(dt)

        let allChunksInitialized = true
        this.pendingChunksToRigidBodies.forEach(chunk => {
            if (chunk.initialized) {
                this.physics.addMeshCollider(chunk.Collider);
                this.pendingChunksToRigidBodies.delete(chunk);
            } else {
                allChunksInitialized = false
            }
        })

        if (allChunksInitialized && this.pendingChunksToRigidBodies.size == 0 && !this.initialized) {
            this.physics.finalizeEnvironmentColliders();
            this.pendingChunksToRigidBodies.clear();
            this.initialized = true;
        }
    }

}