import * as THREE from 'three';
import { CHUNK_GRID_SIZE, CHUNK_SIZE } from './world.js';



export class Raycaster extends THREE.Raycaster {
    constructor (camera, world) {
        super();
        this.camera = camera;
        this.world = world;

        this.near = 1;
        this.far = 5;
    }

    settle() {
        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);
        this.set(this.camera.position, direction);
    }

    getLandscapeIntersection(playerPosition) {
        const chunkX = Math.floor((playerPosition.x + CHUNK_SIZE / 2) / CHUNK_SIZE);
        const chunkZ = Math.floor((playerPosition.z + CHUNK_SIZE / 2) / CHUNK_SIZE);
        const chunks = [];
        const chunk = this.world.chunks.get(`${chunkX},${chunkZ}`);
        chunks.push(chunk);
    
        /*
        let threshold = 5;
        
        // Add neighboring chunks to the chunks array if within threshold
        for (let dx = -1; dx <= 1; dx++) {
            for (let dz = -1; dz <= 1; dz++) {
                // Skip the center chunk (already added)
                if (dx === 0 && dz === 0) continue;
    
                const neighborChunk = this.world.chunks.get(`${chunkX + dx},${chunkZ + dz}`);
                if (neighborChunk) {
                    // Check if the player is within threshold distance from the neighbor chunk
                    const distance = Math.sqrt(Math.pow(playerPosition.x - (chunkX + dx) * CHUNK_SIZE, 2) + Math.pow(playerPosition.z - (chunkZ + dz) * CHUNK_SIZE, 2));
                    if (distance <= threshold * CHUNK_SIZE) {
                        chunks.push(neighborChunk);
                    }
                }
            }
        }
        */
    
        this.settle();
    
        chunks.forEach(chunk => {
            const intersection = this.intersectObject(chunk.Collider);
            if (intersection.length > 0) {
                const position = intersection[0].point;
    
                position.x = Math.round(position.x);
                position.z = Math.round(position.z);
                position.y = chunk.heightMap[(position.x + 25) % CHUNK_SIZE][( - (position.z - 25)) % CHUNK_SIZE];
    
                //mesh.position.copy(position);
            }
        });
    }
    
}