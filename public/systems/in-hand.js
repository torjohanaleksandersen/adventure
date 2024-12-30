import * as THREE from 'three'

export class InHand {
    constructor (bone) {
        this.bone = bone;
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial();
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.visible = false;
        this.mesh.name = "in-hand-helper-mesh"

        this.bone.add(this.mesh);
    }

    getEndOfTorch() {
        this.mesh.position.set(-0.005, 0.003, -0.0002)
        const position = new THREE.Vector3();
        this.mesh.getWorldPosition(position);
        return position;
    }
}