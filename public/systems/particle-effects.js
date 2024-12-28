import * as THREE from 'three'
import { time } from '../main.js';



export class ParticleEffects extends THREE.Object3D {
    constructor() {
        super()

        this.particles = {};
        this.particles.snow = null;
        this.particles.rain = null;
    }

    createWeather(name) {
        let options = {};
        if (name == 'snow') {
            options = {
                count: 5000,
                area: new THREE.Vector2(100, 100),
                scaleScalar: 0.3,
                opacity: 0.8,
                position: new THREE.Vector2(0, 0),
                name: 'snow',
                color: 0xffffff,
                gravity: 0.1
            };
        } else if (name == 'rain') {
            options = {
                count: 10000,
                area: new THREE.Vector2(100, 100),
                scaleScalar: 0.1,
                opacity: 0.8,
                position: new THREE.Vector2(0, 0),
                name: 'rain',
                color: 0x395877,
                gravity: 0.2
            }
        };
        this.createWeatherParticles(options)
    }

    createWeatherParticles(options = {}) 
    {
        const {
            count = 0,
            area = new THREE.Vector2(50, 50),
            scaleScalar = 0,
            opacity = 0,
            position = new THREE.Vector2(0, 0),
            name = '',
            color = 0x000000,
            gravity = 0,
        } = options;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() * area.x) - (area.x / 2); // x
            positions[i * 3 + 1] = Math.random() * 100; // y
            positions[i * 3 + 2] = (Math.random() * area.y) - (area.y / 2); // z
        }

        const material = new THREE.PointsMaterial({
            color: color,
            size: scaleScalar,
            transparent: true,
            opacity: opacity,
            depthTest: true
        });

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.computeBoundingSphere();

        const weather = new THREE.Points(geometry, material);
        weather.name = name;
        weather.userData.gravity = gravity;

        weather.position.set(position.x, 0, position.y);
        this.particles[name] = weather;
        this.add(weather)
    }

    removeWeather(name, pos = null) {
        if (!name) {
            this.removeWeather('rain');
            this.removeWeather('snow');
            return
        }
        if (pos == null) {
            this.remove(this.particles[name]);
            this.particles[name] = null;
        }
    }

    playerChunkChange(x, z) {
        for (const name in this.particles) {
            const mesh = this.particles[name];
            if (!mesh) continue;

            mesh.position.set(x, 0, z);
        }
    }

    update() {
        const weatherTypes = ['snow', 'rain'];
        for (const name of weatherTypes) {
            if (this.particles[name] != null) {
                const mesh = this.particles[name];
                const position = mesh.geometry.attributes.position.array;
                //const wind = weather.windDirection;

                for (let i = 0; i < position.length; i ++) {
                    //position[i * 3] += time.getDelta() * time.tickSpeed * Math.random() //x
                    position[i * 3 + 1] += time.getDelta() * time.tickSpeed * Math.random() - mesh.userData.gravity; //y
                    //position[i * 3 + 2] += time.getDelta() * time.tickSpeed * Math.random() //z

                    if (position[i * 3 + 1] < 0) {
                        position[i * 3 + 1] = Math.random() * 100;
                    }
                }

                mesh.geometry.attributes.position.needsUpdate = true;
            }
        }
    }
}