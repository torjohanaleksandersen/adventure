import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';



export class RigidBody extends THREE.Object3D {
    constructor () {
        super();

        this.position.set(0, 50, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);

        this.onGround = false;

        const mesh = new THREE.Mesh(
            new RoundedBoxGeometry(0.5, 2, 1, 10, 0.25),
            new THREE.MeshBasicMaterial({ color: 0xff00ff})
        )
        this.add(mesh);
        mesh.geometry.translate(0, -0.5, 0)
        this.radius = 0.5;
        this.segment = new THREE.Line3( new THREE.Vector3(), new THREE.Vector3( 0, - 1.0, 0.0 ) );
        this.castShadow = true;
        this.receiveShadow = true;

    }

    update(dt) {
    }
}