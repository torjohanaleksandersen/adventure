import * as THREE from 'three';
import { inputs } from "../main.js";
import { RigidBody } from "./rigidBody.js";







export class Player extends RigidBody {
    constructor (camera) {
        super()
        this.camera = camera

        this.moveInputs = {
            w: false,
            a: false,
            s: false,
            d: false
        }

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
            }
        })
        inputs.registerHandler('keyup', (e) => {
            const key = e.key.toLowerCase()
            
            switch (key) {
                case 'w':
                case 'a':
                case 's':
                case 'd':
                    this.moveInputs[key] = false
            }
        })
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
    
        const k = 10; // Movement speed
        const moveVector = new THREE.Vector3();
    
        // Use clones to prevent modifying original vectors
        if (this.moveInputs.w) {
            moveVector.add(forward.clone().multiplyScalar(k));
        }
        if (this.moveInputs.s) {
            moveVector.add(forward.clone().multiplyScalar(-k));
        }
        if (this.moveInputs.d) {
            moveVector.add(side.clone().multiplyScalar(k));
        }
        if (this.moveInputs.a) {
            moveVector.add(side.clone().multiplyScalar(-k));
        }
    
        this.velocity.x = moveVector.x;
        this.velocity.z = moveVector.z;
    }
    

    update(dt) {
        this.move()

        this.camera.position.copy(this.position)
    }
}