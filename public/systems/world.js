import * as THREE from 'three'
import { Chunk } from './chunk.js'
import { grid, time } from '../main.js';
import { GLTFLoader } from '../imports/three/examples/jsm/Addons.js';

const CHUNK_SIZE = 50;
const CHUNK_GRID_SIZE = 50;
const DRAW_RANGE = 4;
const PHYSICS_DISTANCE = 2
const WORLD_SIZE = CHUNK_SIZE * (DRAW_RANGE * 2 - 1);
const WORLD_GRID_SIZE = CHUNK_GRID_SIZE * (DRAW_RANGE * 2 - 1);

export class World extends THREE.Group {
    constructor (physics, player) {
        super();
        this.physics = physics;
        this.player = player;
        this.chunks = new Map();
        this.pendingChunksToRigidBodies = new Set();
        this.initialized = false;
        
        for (let x = - DRAW_RANGE + 1; x < DRAW_RANGE; x++) {
            for (let z = - DRAW_RANGE + 1; z < DRAW_RANGE; z++) {
                let collidable = true;
                if (Math.abs(x) > PHYSICS_DISTANCE - 1 || Math.abs(z) > PHYSICS_DISTANCE - 1) collidable = false;
                this.generateChunk(x, z, collidable)
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

    generateChunk(x, z, collidable = true) {
        const chunk = new Chunk(x, z, CHUNK_SIZE, CHUNK_GRID_SIZE);
        this.chunks.set(`${x},${z}`, chunk);

        chunk.position.set(x * (CHUNK_SIZE), 0, z * (CHUNK_SIZE));
        this.add(chunk);
        grid.setChunk(x, z);
        if (collidable) this.pendingChunksToRigidBodies.add(chunk);
    }

    addWater() {
        const geometry = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, WORLD_GRID_SIZE, WORLD_GRID_SIZE);
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

        for (let i = 0; i < position.count; i += 1) {
            const x = position.array[i * 3];
            const z = position.array[i * 3 + 1];

            const y = Math.sin(x + time.getTime()) + Math.cos(z + time.getTime());
            position.array[i * 3 + 2] = y * 0.08;
        }
        position.needsUpdate = true;
    }

    getChunksToLoad() {
        const playerChunkX = Math.ceil((this.player.position.x - CHUNK_SIZE / 2) / CHUNK_SIZE);
        const playerChunkZ = Math.ceil((this.player.position.z - CHUNK_SIZE / 2) / CHUNK_SIZE);
    
        const chunksToLoad = [];
    
        const startX = playerChunkX - DRAW_RANGE + 1;
        const endX = playerChunkX + DRAW_RANGE;
        const startZ = playerChunkZ - DRAW_RANGE + 1;
        const endZ = playerChunkZ + DRAW_RANGE;
    
        for (let x = startX; x < endX; x++) {
            for (let z = startZ; z < endZ; z++) {
                const chunkKey = `${x},${z}`;
                if (!this.chunks.has(chunkKey)) {
                    chunksToLoad.push(chunkKey);
                }
            }
        }

        return chunksToLoad;
    }

    getChunksToRemove() {
        const playerChunkX = Math.ceil((this.player.position.x - CHUNK_SIZE / 2) / CHUNK_SIZE);
        const playerChunkZ = Math.ceil((this.player.position.z - CHUNK_SIZE / 2) / CHUNK_SIZE);
    
        const chunksToKeep = [];
        const chunksToRemove = [];
    
        const startX = playerChunkX - DRAW_RANGE + 1;
        const endX = playerChunkX + DRAW_RANGE;
        const startZ = playerChunkZ - DRAW_RANGE + 1;
        const endZ = playerChunkZ + DRAW_RANGE;
    
        for (let x = startX; x < endX; x++) {
            for (let z = startZ; z < endZ; z++) {
                const chunkKey = `${x},${z}`;
                chunksToKeep.push(chunkKey);
            }
        }

        this.chunks.keys().forEach(key => {
            if (!chunksToKeep.includes(key)) {
                chunksToRemove.push(key);
            }
        })

        return chunksToRemove;
    }

    getChunksToMakeRigidBodies() {
        const playerChunkX = Math.ceil((this.player.position.x - CHUNK_SIZE / 2) / CHUNK_SIZE);
        const playerChunkZ = Math.ceil((this.player.position.z - CHUNK_SIZE / 2) / CHUNK_SIZE);

        const chunksToMakeRigidBodies = [];
    
        const startX = playerChunkX - PHYSICS_DISTANCE + 1;
        const endX = playerChunkX + PHYSICS_DISTANCE;
        const startZ = playerChunkZ - PHYSICS_DISTANCE + 1;
        const endZ = playerChunkZ + PHYSICS_DISTANCE;
    
        for (let x = startX; x < endX; x++) {
            for (let z = startZ; z < endZ; z++) {
                const chunkKey = `${x},${z}`;
                chunksToMakeRigidBodies.push(chunkKey);
            }
        }

        return chunksToMakeRigidBodies;
    }

    renderNewChunks() {
        const chunksToLoad = this.getChunksToLoad();
        if (chunksToLoad.length == 0) return;
        const chunksToRemove = this.getChunksToRemove()
        const chunksToMakeRigidBodies = this.getChunksToMakeRigidBodies()
        

        this.physics.meshes = []

        chunksToLoad.forEach(key => {
            const [x, z] = key.split(',');

            this.generateChunk(x, z, false);
        })

        chunksToRemove.forEach(key => {
            const [x, z] = key.split(',');

            grid.deleteChunk(x, z);

            this.remove(this.chunks.get(key))
            this.chunks.delete(key);
        })

        chunksToMakeRigidBodies.forEach(key => {
            const chunkMesh = this.chunks.get(key).Collider;

            this.physics.addMeshCollider(chunkMesh);
        })

        const playerChunkX = Math.ceil((this.player.position.x - CHUNK_SIZE / 2) / CHUNK_SIZE);
        const playerChunkZ = Math.ceil((this.player.position.z - CHUNK_SIZE / 2) / CHUNK_SIZE);

        this.waterMesh.position.set(playerChunkX, 0, playerChunkZ).multiplyScalar(CHUNK_SIZE)

        this.initialized = false;
    }
    

    update(dt) {

        this.renderNewChunks()
        this.updateWater(dt)

        let allChunksInitialized = true
        this.pendingChunksToRigidBodies.forEach(chunk => {
            if (chunk.initialized) {
                this.physics.addMeshCollider(chunk.Collider);
                
                /*
                chunk.CollidableAssets.children.forEach(collider => {
                    collider.levels[0].object.children.forEach(child => {
                        this.physics.addMeshCollider(child);
                    })
                })
                */
                this.pendingChunksToRigidBodies.delete(chunk);
            } else {
                allChunksInitialized = false;
            }
        })

        if (allChunksInitialized && this.pendingChunksToRigidBodies.size == 0 && !this.initialized) {
            this.physics.finalizeEnvironmentColliders();
            this.pendingChunksToRigidBodies.clear();
            this.initialized = true;
        }
    }

}