import * as THREE from 'three'
import { time, weather } from '../main.js';



export class ParticleEffects extends THREE.Object3D {
    constructor() {
        super()

        this.particles = {};
        this.particles.snow = []
    }

    createSnow({
        count = 500,
        area = new THREE.Vector2(50, 50),
        scaleScalar = 0.3,
        opacity = 0.8,
        position = new THREE.Vector2(0, 0)
    }) 
    {
        const snowflakeGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() * area.x) - (area.x / 2); // x
            positions[i * 3 + 1] = Math.random() * 100; // y
            positions[i * 3 + 2] = (Math.random() * area.y) - (area.y / 2); // z
        }

        const snowflakeMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: ( scaleScalar / 2) + ( Math.random() * scaleScalar),
            transparent: true,
            opacity: ( opacity / 2) + ( Math.random() * opacity),
            depthTest: true
        });

        snowflakeGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const snow = new THREE.Points(snowflakeGeometry, snowflakeMaterial);
        snow.name = 'snow';
        snow.position.set(position.x, 0, position.y);
        this.particles.snow.push(snow);
        this.add(snow)
    }

    removeSnow(pos = null) {
        if (pos == null) {
            this.particles.snow.forEach(snow => {
                if (snow.name == 'snow') {
                    this.remove(snow);
                }
            })
            this.particles.snow = [];
        }
    }

    update() {
        if (this.particles.snow.length > 0) {
            this.particles.snow.forEach(snow => {
                const position = snow.geometry.attributes.position.array;
                const wind = weather.windDirection;

                for (let i = 0; i < position.length; i ++) {
                    position[i * 3] += time.getDelta() * time.tickSpeed * Math.random() * weather.windDirection.x; //x
                    position[i * 3 + 1] += time.getDelta() * time.tickSpeed * Math.random() * weather.windDirection.y - 0.03; //y
                    position[i * 3 + 2] += time.getDelta() * time.tickSpeed * Math.random() * weather.windDirection.z; //z

                    if (position[i * 3 + 1] < 0) {
                        position[i * 3 + 1] = Math.random() * 100;
                    }
                }

                snow.geometry.attributes.position.needsUpdate = true;
            })
        }
    }
}