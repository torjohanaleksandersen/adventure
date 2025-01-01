import * as THREE from 'three';
import { inputs, models, particleEffects } from "../main.js";
import { RigidBody } from "./rigidBody.js";
import { GLTFLoader } from '../imports/three/examples/jsm/Addons.js';
import { modelsData } from '../data/models.js';
import { InHand } from './in-hand.js';
import { CHUNK_SIZE } from './world.js';


const loader = new GLTFLoader();
let inHand = new InHand(new THREE.Object3D());

export class Player extends RigidBody {
    constructor (camera) {
        super()
        this.camera = camera
        this.skin = new THREE.Object3D()
        this.add(this.skin);
        this.raycaster = null;
        this.world = null;


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
        this.lastState = {};

        this.actions = {};
        this.mixer = new THREE.AnimationMixer();
        this.currentAnimation = '';
        this.animationLocked = false;


        this.hotbar = ["sword", "axe", "torch", "knife", "shovel", null];
        this.activeSlot = 0;
        this.inHand = '';

        this.buildingHotbar = ["campfire", null, null];
        this.activeBuildingSlot = 0;


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
                    if (this.state.building) this.state.building = false;
                    else this.state.building = true;
                    break;
                case 'e':
                    this.setAction("Interact");
                    this.lockAction("Interact");
                    break;
                case 'f':
                    this.interactWithInHand();
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                    this.activeSlot = parseInt(key) - 1;
                    this.activeBuildingSlot = this.activeSlot % this.buildingHotbar.length;
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
            }
        })
        inputs.registerHandler("mousedown", (e) => {
            if (e.button == 0) {
                if (this.state.building) {
                    this.build();
                    return;
                };
                let action = Math.random() > 0.5 ? "Right" : "Left";
                if (this.keys["x"]) action = "Kick_" + action;
                else action = "Punch_" + action;

                if (this.inHand != null && !this.keys["x"]) action = "Sword_Slash"

                this.setAction(action);
                this.lockAction(action);
            }
            if (e.button == 2) {
                this.raycaster.getLandscapeIntersection(this.position);
            }
        })
    }

    interactWithInHand() {
        if (this.inHand === "torch") {
            const torch = this.wrist.getObjectByName(this.inHand);
            if (torch) {
                let state = torch.userData.state || 0;
                if (state === 1) {
                    particleEffects.removeTorchFlames();
                    state = 0;
                } else if (state === 0) {
                    particleEffects.createTorchFlames();
                    state = 1;
                }
                torch.userData.state = state;
            }
        }
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

                    const skeleton = new THREE.SkeletonHelper(this.skin);
                    this.wrist = skeleton.bones.filter(element => element.name == "WristR")[0]

                    inHand = new InHand(this.wrist);


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

        let idleAnimName = "Idle";
        if (this.inHand != null) {
            idleAnimName += "_Sword";
        }

        let m = this.moveInputs;
        if (m.w && !m.a && !m.d && !m.s) {
            this.setAction("Run");
        } else if ((!m.w && (m.a || m.d || m.s)) || (m.w && (m.a || m.d || m.s))) {
            this.setAction("Walk");
        } else if (!(m.w && m.a && m.d && m.s)) {
            this.setAction(idleAnimName);
        }
    }

    onChunkChange(chunkX, chunkZ, lastChunkX, lastChunkZ) {
        const chunk = this.world.chunks.get(`${chunkX},${chunkZ}`);
        const lastChunk = this.world.chunks.get(`${lastChunkX},${lastChunkZ}`);
        if (this.state.building) {
            chunk.addWireframe();
            lastChunk.removeWireframe();
        }
    }

    build() {
        const building = this.buildingHotbar[this.activeBuildingSlot];
        if (!building) return;


    }

    holdItem(name) {
        if (this.inHand == name) return;
        const bone = this.wrist;
        
        bone.remove(bone.getObjectByName(this.inHand));

        if (name == null) {
            this.inHand = null;
            return;
        }

        let modelData = null;
        for (const type in modelsData) {
            for (const key in modelsData[type]) {
                if (key == name) modelData = modelsData[type][key]
            }
        }
        const model = models.getModel(name);
        if (!model || !modelData) return;

        model.scale.setScalar(modelData.scaleScalar);
        model.position.copy(modelData.position);
        model.rotation.set(modelData.rotation.x, modelData.rotation.y, modelData.rotation.z);
        model.userData = modelData.userData || {};
        model.userData.state = 0;

        model.name = name;

        bone.add(model);
        this.inHand = name;
    }

    stateChange() {
        if (!this.world) return
        const s = this.state

        const chunkX = Math.floor((this.position.x + CHUNK_SIZE / 2) / CHUNK_SIZE);
        const chunkZ = Math.floor((this.position.z + CHUNK_SIZE / 2) / CHUNK_SIZE);

        const chunk = this.world.chunks.get(`${chunkX},${chunkZ}`);
        if (s.building) {
            chunk.addWireframe();
            this.holdItem("paper");
        } else {
            chunk.removeWireframe();
        }
    }

    update(dt) {
        this.move()
        this.updateSkin()

        if (JSON.stringify(this.state) !== JSON.stringify(this.lastState)) {
            this.stateChange();
        }
        this.lastState = { ...this.state };

        if (this.velocity.x != this.requestedVelocity.x || this.velocity.z != this.requestedVelocity.z) {
            const dx = this.requestedVelocity.x - this.velocity.x;
            const dz = this.requestedVelocity.z - this.velocity.z;

            this.velocity.x += dx * this.acceleration * dt;
            this.velocity.z += dz * this.acceleration * dt;
        }

        if (this.inHand == "torch") {
            const endOfTorch = inHand.getEndOfTorch();

            particleEffects.updateTorchFlamesPosition(endOfTorch);
        } else {
            particleEffects.removeTorchFlames();
        }

        if (this.activeSlot == null) {
            this.holdItem(null);
        } else if (this.hotbar[this.activeSlot] != this.inHand && !this.state.building) {
            this.holdItem(this.hotbar[this.activeSlot]);
        }

        if (this.state.building) {
            
        }
        

        this.mixer.update(dt);
    }
}