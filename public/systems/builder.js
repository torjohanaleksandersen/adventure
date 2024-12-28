import * as THREE from 'three';
import { CHUNK_GRID_SIZE, CHUNK_SIZE } from './world.js';

export class Builder {
    constructor(camera, world, player) {
        this.camera = camera;
        this.world = world;
        this.player = player;

        this.ray = new THREE.Raycaster(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -1, 0));
        this.ray.near = 1;
        this.ray.far = 5;
    }

    getIntersection() {
        const origin = this.camera.position.clone();
        const direction = new THREE.Vector3(0, 0, 0);
        this.camera.getWorldDirection(direction);

        this.ray.set(origin, direction);

        const chunkX = Math.ceil((this.player.position.x - CHUNK_SIZE / 2) / CHUNK_SIZE);
        const chunkZ = Math.ceil((this.player.position.z - CHUNK_SIZE / 2) / CHUNK_SIZE);
        const chunk = this.world.chunks.get(`${chunkX},${chunkZ}`);

        const intersects = this.ray.intersectObject(chunk.Collider);

        if (intersects.length > 0) {
            return intersects[0];
        }
        return null;
    }

    

}
