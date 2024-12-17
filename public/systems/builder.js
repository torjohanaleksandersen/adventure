import * as THREE from 'three';
import { CHUNK_GRID_SIZE, CHUNK_SIZE } from './world.js';

function mod(n, m) {
    return ((n % m) + m) % m;
}

export class Builder {
    constructor(camera, world) {
        this.camera = camera;
        this.world = world;

        this.ray = new THREE.Ray(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -1, 0));
        this.ray.far = 5;

        this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    }

    getHeightAtPlayerPosition() {
        const direction = new THREE.Vector3(0, 0, 0);
        this.camera.getWorldDirection(direction);

        this.plane.normal.set(0, 0, 1)
        this.plane.constant = - (this.camera.position.y - 1);

        this.ray.set(this.camera.position.clone(), direction);

        const point = new THREE.Vector3(0, 0, 0);
        const intersects = this.ray.intersectPlane(this.plane, point);

        if (intersects) {
            console.log(point.x, point.z)
        } else {
            console.log('no intersection')
        }

        return point;
    }

    getBuildingPosition() {
        return this.getHeightAtPlayerPosition();
    }
}
