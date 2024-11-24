import * as THREE from 'three';
import { inputs } from "../main.js";
import { RigidBody } from "./rigidBody.js";
import { FBXLoader } from '../imports/FBXLoader/FBXLoader.js';
import { Animator } from './animator.js';


const loader = new FBXLoader();

export class Player extends RigidBody {
    constructor (camera) {
        super()
        this.camera = camera
        this.skin = new THREE.Object3D()


        this.moveInputs = {
            w: false,
            a: false,
            s: false,
            d: false
        }

        this.state = {
            movement: 'idle'
        }


        this.speed = 10






        inputs.registerHandler('keydown', (e) => {
            const key = e.key.toLowerCase()
            
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
            }
        })
        inputs.registerHandler('keyup', (e) => {
            const key = e.key.toLowerCase()
            
            switch (key) {
                case 'w':
                case 'a':
                case 's':
                case 'd':
                    this.moveInputs[key] = false;
                    break;
            }
        })
    }

    loadModel() {
        return new Promise((resolve, reject) => {
            loader.load(
                'models/characters/main-skin.fbx',
                (fbx) => {
                    fbx.scale.setScalar(0.009);
                    this.skin = fbx;
                    this.animator = new Animator(new THREE.AnimationMixer(this.skin));


                    resolve(fbx)
                }, // Resolve with the loaded model
                undefined, // Optional: Progress callback
                (error) => reject(error) // Reject if there's an error
            );
        });
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
            moveVector.add(forward.clone().multiplyScalar(this.speed));
        }
        if (this.moveInputs.s) {
            moveVector.add(forward.clone().multiplyScalar(-this.speed));
        }
        if (this.moveInputs.d) {
            moveVector.add(side.clone().multiplyScalar(this.speed));
        }
        if (this.moveInputs.a) {
            moveVector.add(side.clone().multiplyScalar(-this.speed));
        }
    
        this.velocity.x = moveVector.x;
        this.velocity.z = moveVector.z;
    }
    
    updateSkin() {
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);

        const azimuthalAngle = Math.atan2(cameraDirection.x, cameraDirection.z);

        this.skin.rotation.y = azimuthalAngle;

        this.skin.position.copy(this.position);
        this.skin.translateY(-1);
        this.skin.translateZ(-0.5)
    }

    update(dt) {
        this.move()
        this.updateSkin()
        
        const isMoving = Object.values(this.moveInputs).some((value) => value);
        this.state.movement = isMoving ? 'walking' : 'idle';

        if (this.animator) {
            this.animator.play(this.state.movement);
            this.animator.update(dt);
        }

        this.camera.position.copy(this.position).add(new THREE.Vector3(0, 0, 0))
    }
}