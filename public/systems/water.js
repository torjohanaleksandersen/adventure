import * as THREE from 'three'
import { time, weather } from '../main.js';


export class Water extends THREE.Mesh {
    constructor ({
        size = 1, 
        gridsize = 10,
        waveSize = 0.08
    }) {
        super();

        this.geometry = new THREE.PlaneGeometry(size, size, gridsize, gridsize);
        this.material = new THREE.MeshLambertMaterial({
            color: 0x003482,
            metalness: 0.3,
            roughness: 0.7,
            flatShading: true,
            transparent: true,
            side: THREE.DoubleSide,
            opacity: 0.7,
        })

        this.name = 'water';
        this.castShadow = true;
        this.receiveShadow = true;
        this.rotation.x = - Math.PI / 2;

        this.waveSize = waveSize;
    }

    update(windInfluence = true) {
        const position = this.geometry.attributes.position;

        let wind = new THREE.Vector2(0, 0);
        if (windInfluence) {
            wind.set(weather.windDirection.x, weather.windDirection.z);
        }


        for (let i = 0; i < position.count; i ++) {
            const x = position.array[i * 3];
            const z = position.array[i * 3 + 1];

            const y = Math.sin((x + time.getTime()) * wind.x) + Math.sin((z + time.getTime()) * wind.y);
            position.array[i * 3 + 2] = y * this.waveSize;
        }
        position.needsUpdate = true;
    }
}