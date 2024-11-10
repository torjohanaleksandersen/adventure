import * as THREE from 'three';
import { inputs } from "../main.js";
import { RigidBody } from "./rigidBody.js";







export class Player extends RigidBody {
    constructor (camera, scene) {
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
        forward.y = 0;
        const side = this.getSideVector();
        side.y = 0

        const k = 10
        const moveVector = new THREE.Vector3(0, 0, 0);
        if (this.moveInputs.w === true) {
            moveVector.add(forward.multiplyScalar(k))
        }
        if (this.moveInputs.s === true) {
            moveVector.add(forward.multiplyScalar(- k))
        }
        if (this.moveInputs.d === true) {
            moveVector.add(side.multiplyScalar(k))
        }
        if (this.moveInputs.a === true) {
            moveVector.add(side.multiplyScalar(- k))
        }
        this.velocity.x = moveVector.x;
        this.velocity.z = moveVector.z;
    }

    update(dt) {
        this.move()

        this.camera.position.copy(this.position);
    }
}