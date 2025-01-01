import * as THREE from 'three'
import { mesh, time } from '../main.js';



export class ParticleEffects extends THREE.Object3D {
    constructor() {
        super()

        this.particles = {};
        this.particles.snow = null;
        this.particles.rain = null;

        this.endOfTorchPosition = new THREE.Vector3(0, 0, 0);
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

    updateWeather() {
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

    playerChunkChange(x, z) {
        for (const name in this.particles) {
            const mesh = this.particles[name];
            if (!mesh) continue;

            mesh.position.set(x, 0, z);
        }
    }

    createTorchFlames() {
        const position = this.endOfTorchPosition;
        const count = 20; // Number of particles
        const points = new THREE.Object3D();
        points.name = "torch-flame-points";
        this.add(points);
    
        for (let i = 0; i < count; i++) {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(3);
    
            // Randomized initial positions
            positions[0] = position.x - 0.1 + Math.random() * 0.2; // x
            positions[1] = position.y + Math.random() * 0.3;       // y
            positions[2] = position.z - 0.1 + Math.random() * 0.2; // z
    
            geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
            const material = new THREE.PointsMaterial({
                color: 0xff4500, // Flame color
                size: 0.1 - Math.random() * 0.03,
                transparent: true,
                opacity: 0.9,
            });
            const point = new THREE.Points(geometry, material);
            point.frustumCulled = false;
    
            // Store initial and maximum heights
            point.userData.startHeight = positions[1];
            point.userData.maxHeight = positions[1] + 0.05 + Math.random() * 0.05; // Randomized max height
            point.userData.respawnDelay = 0; // Delay before respawning
    
            points.add(point);
        }


        const light = new THREE.PointLight(0xff4500, 2);
        light.position.copy(position);
        light.name = 'point-light';
        light.decay = 1;
        points.add(light);


    }
    
    updateTorchFlames() {
        const size = 0.1; // Flame spread size
        const points = this.getObjectByName("torch-flame-points");
        if (!points) return;
    
        points.children.forEach((obj) => {
            if (obj.name == 'point-light') {
                obj.position.copy(this.endOfTorchPosition.clone().add(new THREE.Vector3(0, 0.2, 0)));
                //mesh.position.copy(obj.position)
                return;
            };
            const position = obj.geometry.attributes.position.array;
    
            // Upward motion with slight oscillation
            position[1] += 0.3 * time.getDelta() + Math.sin(time.getDelta() * 5) * 0.001; // Smooth upward movement
    
            if (position[1] >= obj.userData.maxHeight) {
                // Add delay before respawn
                obj.userData.respawnDelay += time.getDelta();
                if (obj.userData.respawnDelay > 0.1) {
                    // Respawn particle with randomized position
                    position[0] = this.endOfTorchPosition.x - (size / 2) + Math.random() * size; // x
                    position[1] = this.endOfTorchPosition.y + Math.random() * 0.2;               // y
                    position[2] = this.endOfTorchPosition.z - (size / 2) + Math.random() * size; // z
    
                    obj.userData.startHeight = position[1];
                    obj.userData.maxHeight = position[1] + 0.05 + Math.random() * 0.05; // Update max height
                    obj.userData.respawnDelay = 0; // Reset delay
                }
            }
    
            obj.geometry.attributes.position.needsUpdate = true;
        });
    }

    removeTorchFlames() {
        const points = this.getObjectByName("torch-flame-points");
        if (!points) return;
        this.remove(points);
    }
    

    updateTorchFlamesPosition(position) {
        this.endOfTorchPosition.copy(position);
    }

    update() {
        this.updateWeather();
        this.updateTorchFlames();
    }
}