import * as THREE from 'three'
import { Chunk } from './chunk.js'
import { grid, particleEffects, weather } from '../main.js';
import { Water } from './water.js';

export const CHUNK_SIZE = 50;
export const CHUNK_GRID_SIZE = 50;
export const DRAW_RANGE = 4;
const PHYSICS_DISTANCE = 2;
const NATURE_DRAW_RANGE = 3;
const SIMULATION_DISTANCE = 3;
const WORLD_SIZE = CHUNK_SIZE * (DRAW_RANGE * 2 - 1);
const WORLD_GRID_SIZE = CHUNK_GRID_SIZE * (DRAW_RANGE * 2 - 1);

let lastChunkX = 0, lastChunkZ = 0;

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

        this.icemesh = new THREE.Object3D;
        this.addIce();
        this.icemesh.visible = false;


        //this.addIce()
        this.updateChunksPlayerDistance()
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

    updateChunksPlayerDistance() {
        const playerChunkX = Math.ceil((this.player.position.x - CHUNK_SIZE / 2) / CHUNK_SIZE);
        const playerChunkZ = Math.ceil((this.player.position.z - CHUNK_SIZE / 2) / CHUNK_SIZE);
    
        const startX = playerChunkX - DRAW_RANGE + 1;
        const endX = playerChunkX + DRAW_RANGE;
        const startZ = playerChunkZ - DRAW_RANGE + 1;
        const endZ = playerChunkZ + DRAW_RANGE;
    
        for (let x = startX; x < endX; x++) {
            for (let z = startZ; z < endZ; z++) {
                const chunkKey = `${x},${z}`;
                if (this.chunks.has(chunkKey)) {
                    const chunk = this.chunks.get(chunkKey);
                    const d = {
                        x: Math.abs(chunk.x - playerChunkX),
                        z: Math.abs(chunk.z - playerChunkZ)
                    }
                    const distance = Math.max(d.x, d.z);
                    chunk.updateLOD(distance, NATURE_DRAW_RANGE);
                }
            }
        }
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
        this.river = new Water({size: WORLD_SIZE, gridsize: WORLD_GRID_SIZE, waveSize: 0.08});
        this.add(this.river)
    }

    addIce() {
        this.river.visible = false;
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const colors = [];

        const triangleSize = WORLD_SIZE;

        const x = - triangleSize / 2;
        const z = - triangleSize / 2;

        // Triangle 1 of each grid square
        vertices.push(x, z, 0);
        vertices.push(x + triangleSize, z, 0);
        vertices.push(x, z + triangleSize, 0);

        const c = new THREE.Color(0xd6fffa)

        colors.push(c.r, c.g, c.b);
        colors.push(c.r, c.g, c.b);
        colors.push(c.r, c.g, c.b);

        // Triangle 2 of each grid square
        vertices.push(x + triangleSize, z, 0);
        vertices.push(x + triangleSize, z + triangleSize, 0);
        vertices.push(x, z + triangleSize, 0);

        colors.push(c.r, c.g, c.b);
        colors.push(c.r, c.g, c.b);
        colors.push(c.r, c.g, c.b);

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = - Math.PI / 2;

        mesh.name = 'ice';
        this.icemesh = mesh;

        this.add(mesh)
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

        this.river.position.set(playerChunkX, 0, playerChunkZ).multiplyScalar(CHUNK_SIZE)

        this.updateChunksPlayerDistance()

        this.initialized = false;
    }
    
    updateChunks() {
        const playerChunkX = Math.ceil((this.player.position.x - CHUNK_SIZE / 2) / CHUNK_SIZE);
        const playerChunkZ = Math.ceil((this.player.position.z - CHUNK_SIZE / 2) / CHUNK_SIZE);

    
        const startX = playerChunkX - SIMULATION_DISTANCE + 1;
        const endX = playerChunkX + SIMULATION_DISTANCE;
        const startZ = playerChunkZ - SIMULATION_DISTANCE + 1;
        const endZ = playerChunkZ + SIMULATION_DISTANCE;
    
        for (let x = startX; x < endX; x++) {
            for (let z = startZ; z < endZ; z++) {
                const chunkKey = `${x},${z}`;
                const chunk = this.chunks.get(chunkKey);
                chunk.update();
            }
        }
    }

    update(dt) {

        this.renderNewChunks()
        this.updateChunks()
        this.river.update()

        let allChunksInitialized = true
        this.pendingChunksToRigidBodies.forEach(chunk => {
            if (chunk.initialized) {
                this.physics.addMeshCollider(chunk.Collider);
                this.pendingChunksToRigidBodies.delete(chunk);
            } else {
                allChunksInitialized = false;
            }
        })

        if (allChunksInitialized && this.pendingChunksToRigidBodies.size == 0 && !this.initialized) {
            if (this.icemesh.visible) this.physics.addMeshCollider(this.icemesh);
            this.physics.finalizeEnvironmentColliders();
            this.pendingChunksToRigidBodies.clear();
            this.initialized = true;
        }



        const chunkX = Math.ceil((this.player.position.x - CHUNK_SIZE / 2) / CHUNK_SIZE);
        const chunkZ = Math.ceil((this.player.position.z - CHUNK_SIZE / 2) / CHUNK_SIZE);

        if (chunkX != lastChunkX || chunkZ != lastChunkZ) {
            //const chunk = this.chunks.get(`${chunkX},${chunkZ}`)
            particleEffects.playerChunkChange(chunkX * CHUNK_SIZE, chunkZ * CHUNK_SIZE);
            this.player.onChunkChange(chunkX, chunkZ, lastChunkX, lastChunkZ);

            lastChunkX = chunkX;
            lastChunkZ = chunkZ;
        }

        if (weather.iceOnWater) {
            if (!this.icemesh.visible) this.initialized = false;
            this.icemesh.visible = true;
            this.river.visible = false;
        } else {
            if (!this.river.visible) this.initialized = false;
            this.icemesh.visible = false;
            this.river.visible = true;
        }
    }

}