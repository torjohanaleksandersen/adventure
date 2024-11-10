import * as THREE from 'three';
import * as BufferGeometryUtils from '../imports/files/BufferGeometryUtils.js';
import { MeshBVH, StaticGeometryGenerator } from 'three-mesh-bvh';

let environment, collider;
let tempVector = new THREE.Vector3();
let tempVector2 = new THREE.Vector3();
let tempBox = new THREE.Box3();
let tempMat = new THREE.Matrix4();
let tempSegment = new THREE.Line3();
const clock = new THREE.Clock();

export class Physics {
    constructor(scene) {
        this.scene = scene;
        this.GRAVITY = -30;
        this.rigidBodies = [];
        this.meshes = []; // Collect all meshes here
    }

    // Use this method to add individual meshes to the list
    addMeshCollider(mesh) {
        // Ensure world matrix is updated to include position/rotation/scale
        mesh.updateMatrixWorld(true);

        // Clone and apply the world matrix to the geometry
        const geometry = mesh.geometry.clone();
        geometry.applyMatrix4(mesh.matrixWorld); // Apply mesh's transformations to the geometry

        this.meshes.push(geometry);
    }

    // Merge all geometries into one collider
    finalizeEnvironmentColliders() {
        if (this.meshes.length === 0) return;

        // Merge all geometries
        const mergedGeometry = BufferGeometryUtils.mergeGeometries(this.meshes);

        // Set up BVH on merged geometry
        mergedGeometry.boundsTree = new MeshBVH(mergedGeometry);

        // Create the collider mesh (for visualization)
        collider = new THREE.Mesh(mergedGeometry, new THREE.MeshStandardMaterial({
            wireframe: true,
            color: 0x000000
        }));

        // Optional: Add the collider to the scene for debugging
        //this.scene.add(collider);
    }

    updateRigidBodies(dt) {
        this.rigidBodies.forEach(rigidBody => {
            if (rigidBody.onGround) {
                rigidBody.velocity.y = dt * this.GRAVITY;
            } else {
                rigidBody.velocity.y += dt * this.GRAVITY;
            }

            rigidBody.position.addScaledVector(rigidBody.velocity, dt);
            rigidBody.updateMatrixWorld();

            tempBox.makeEmpty();
            tempMat.copy(collider.matrixWorld).invert();
            tempSegment.copy(rigidBody.segment);

            tempSegment.start.applyMatrix4(rigidBody.matrixWorld).applyMatrix4(tempMat);
            tempSegment.end.applyMatrix4(rigidBody.matrixWorld).applyMatrix4(tempMat);

            tempBox.expandByPoint(tempSegment.start);
            tempBox.expandByPoint(tempSegment.end);

            tempBox.min.addScalar(-rigidBody.radius);
            tempBox.max.addScalar(rigidBody.radius);

            collider.geometry.boundsTree.shapecast({
                intersectsBounds: box => box.intersectsBox(tempBox),
                intersectsTriangle: tri => {
                    const triPoint = tempVector;
                    const capsulePoint = tempVector2;

                    const distance = tri.closestPointToSegment(tempSegment, triPoint, capsulePoint);
                    if (distance < rigidBody.radius) {
                        const depth = rigidBody.radius - distance;
                        const direction = capsulePoint.sub(triPoint).normalize();

                        tempSegment.start.addScaledVector(direction, depth);
                        tempSegment.end.addScaledVector(direction, depth);
                    }
                }
            });

            const newPosition = tempVector;
            newPosition.copy(tempSegment.start).applyMatrix4(collider.matrixWorld);

            const deltaVector = tempVector2;
            deltaVector.subVectors(newPosition, rigidBody.position);

            rigidBody.onGround = deltaVector.y > Math.abs(dt * rigidBody.velocity.y * 0.25);

            const offset = Math.max(0.0, deltaVector.length() - 1e-5);
            deltaVector.normalize().multiplyScalar(offset);

            rigidBody.position.add(deltaVector);

            if (!rigidBody.onGround) {
                deltaVector.normalize();
                rigidBody.velocity.addScaledVector(deltaVector, -deltaVector.dot(rigidBody.velocity.clone()));
            }

            rigidBody.update(dt);
        });
    }

    addRigidBody(rigidBody) {
        this.rigidBodies.push(rigidBody);
    }

    removeRigidBody(rigidBody) {
        this.rigidBodies.splice(this.rigidBodies.indexOf(rigidBody), 1);
    }

    update() {
        if (!collider) return;
        const delta = Math.min(clock.getDelta(), 0.1);
        const physicsSteps = 5;
        for (let i = 0; i < physicsSteps; i++) {
            this.updateRigidBodies(delta / physicsSteps);
        }
    }
}
