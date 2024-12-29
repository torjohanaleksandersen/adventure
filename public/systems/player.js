import * as THREE from 'three';
import { inputs } from "../main.js";
import { RigidBody } from "./rigidBody.js";
import { GLTFLoader } from '../imports/three/examples/jsm/Addons.js';


const loader = new GLTFLoader();

export class Player extends RigidBody {
    constructor (camera) {
        super()
        this.camera = camera
        this.skin = new THREE.Object3D()
        this.add(this.skin);


        this.moveInputs = {
            w: false,
            a: false,
            s: false,
            d: false
        }

        this.keys = {};

        this.state = {
            building: false,
        }

        this.actions = {};
        this.mixer = new THREE.AnimationMixer();
        this.currentAnimation = '';
        this.animationLocked = false;


        this.inventory = {};


        this.speed = 5;
        this.acceleration = this.speed * 0.8;
        this.requestedVelocity = new THREE.Vector3(0, 0, 0);



        inputs.registerHandler('keydown', (e) => {
            const key = e.key.toLowerCase()

            this.keys[key] = true;
            
            switch (key) {
                case 'w':
                case 'a':
                case 's':
                case 'd':
                    this.moveInputs[key] = true;
                    break;
                case ' ':
                    if (this.onGround) {
                        this.velocity.y = 10;
                        this.onGround = false;
                    }
                    break;
                case 'b':
                    this.state.building = true;
                    break;
                case 'e':
                    this.setAction("Interact");
                    this.lockAction("Interact");
                    break;
            }
        })
        inputs.registerHandler('keyup', (e) => {
            const key = e.key.toLowerCase()

            this.keys[key] = false;
            
            switch (key) {
                case 'w':
                case 'a':
                case 's':
                case 'd':
                    this.moveInputs[key] = false;
                    break;
                case 'b':
                    this.state.building = false;
                    break;
            }
        })
        inputs.registerHandler("mousedown", (e) => {
            if (e.button == 0) {
                let action = Math.random() > 0.5 ? "Right" : "Left";
                if (this.keys["x"]) action = "Kick_" + action;
                else action = "Punch_" + action;

                this.setAction(action);
                this.lockAction(action);
            }
            if (e.button == 2) {
                console.log('R')
            }
        })
    }

    getCollidingGround() {
        const raycaster = new THREE.Raycaster(this.position, new THREE.Vector3(0, -1, 0));
        raycaster.far = 2;
    }

    loadModel() {
        return new Promise((resolve, reject) => {
            loader.load(
                'models/characters/player.glb',
                (gltf) => {
                    const model = gltf.scene;
                    model.scale.setScalar(0.70);
                    this.skin = model;
                    this.mixer = new THREE.AnimationMixer(this.skin);


                    model.traverse(obj => {
                        if (obj.isMesh) {
                            obj.frustumCulled = false;
                            obj.material = new THREE.MeshLambertMaterial({
                                color: obj.material.color,
                                map: obj.material.map,
                                transparent: obj.material.transparent,
                                opacity: obj.material.opacity,
                                side: obj.material.side,
                                emissive: obj.material.emissive,
                                emissiveMap: obj.material.emissiveMap,
                                emissiveIntensity: obj.material.emissiveIntensity,
                                envMap: obj.material.envMap,
                                name: obj.material.name
                            })
                        }
                    })

                    gltf.animations.forEach(clip => {
                        const name = clip.name.split("|")[1]
                        this.actions[name] = this.mixer.clipAction(clip);

                        switch (name) {
                            case "Death":
                            case "HitRecieve":
                            case "HitRecieve_2":
                            case "Interact":
                            case "Kick_Right":
                            case "Kick_Left":
                            case "Punch_Right":
                            case "Punch_Left":
                            case "Sword_Slash":
                                this.actions[name].setLoop(THREE.LoopOnce);
                                this.actions[name].clampWhenFinished = true;
                                break;
                        }

                        this.mixer.addEventListener("finished", () => {
                            this.setAction("Idle");
                        })
                    })

                    resolve(model)
                }, // Resolve with the loaded model
                undefined, // Optional: Progress callback
                (error) => reject(error) // Reject if there's an error
            );
        });
    }

    setAction(name) {
        if (name == this.currentAnimation || this.animationLocked) return;
        Object.keys(this.actions).forEach(key => {
            const action = this.actions[key];
            action.fadeOut(0.2);
        })

        this.currentAnimation = name;
        this.actions[name].reset().fadeIn(0.2).play();
    }

    lockAction(name) {
        if (this.animationLocked) return;
        const action = this.actions[name];
        if (!action) return;
        this.animationLocked = true;
        setTimeout(() => {
            this.animationLocked = false;
        }, action.getClip().duration * 1000)
    }

    getForwardVector() {
        const vec = new THREE.Vector3();
        this.camera.getWorldDirection(vec);
        vec.normalize();
        return vec;
    }

    getSideVector() {
        const vec = new THREE.Vector3();
        this.camera.getWorldDirection(vec);
        vec.normalize();
        vec.cross(this.camera.up);
        return vec;
    }

    move() {
        const forward = this.getForwardVector();
        forward.y = 0; // Ensure movement is restricted to the horizontal plane
        forward.normalize(); // Normalize to ensure consistent magnitude
    
        const side = this.getSideVector();
        side.y = 0;
        side.normalize();
    
        const moveVector = new THREE.Vector3();
    
        // Use clones to prevent modifying original vectors
        if (this.moveInputs.w) {
            moveVector.add(forward.clone().multiplyScalar(1));
        }
        if (this.moveInputs.s) {
            moveVector.add(forward.clone().multiplyScalar(-0.67));
        }
        if (this.moveInputs.d) {
            moveVector.add(side.clone().multiplyScalar(0.67));
        }
        if (this.moveInputs.a) {
            moveVector.add(side.clone().multiplyScalar(-0.67));
        }
    
        this.requestedVelocity.x = moveVector.x;
        this.requestedVelocity.z = moveVector.z;
        this.requestedVelocity.multiplyScalar(this.speed);
    }
    
    updateSkin() {
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);

        const azimuthalAngle = Math.atan2(cameraDirection.x, cameraDirection.z);
        if (cameraDirection.y != -1) this.skin.rotation.y = azimuthalAngle;
        
        this.skin.position.copy(this.position).add(new THREE.Vector3(0, -1.5, 0));

        const head = this.skin.getObjectByName("Head");
        const headPosition = new THREE.Vector3(0, 0, 0);
        head.getWorldPosition(headPosition);

        const forward = new THREE.Vector3();
        this.camera.getWorldDirection(forward);

        forward.y = 0;
        forward.normalize();

        const offset = forward.multiplyScalar(0.15);
        offset.y = 0.05

        this.camera.position.copy(headPosition).add(offset);


        let m = this.moveInputs;
        if (m.w && !m.a && !m.d && !m.s) {
            this.setAction("Run");
        } else if ((!m.w && (m.a || m.d || m.s)) || (m.w && (m.a || m.d || m.s))) {
            this.setAction("Walk");
        } else if (!(m.w && m.a && m.d && m.s)) {
            this.setAction("Idle");
        }


        
    }

    update(dt) {
        this.move()
        this.updateSkin()

        if (this.velocity.x != this.requestedVelocity.x || this.velocity.z != this.requestedVelocity.z) {
            const dx = this.requestedVelocity.x - this.velocity.x;
            const dz = this.requestedVelocity.z - this.velocity.z;

            this.velocity.x += dx * this.acceleration * dt;
            this.velocity.z += dz * this.acceleration * dt;
        }

        this.mixer.update(dt);
    }
}