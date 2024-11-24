import * as THREE from 'three'
import { terrain } from './terrain.js';
import { grid, models } from '../main.js';
import { modelData } from '../data/models.js'



export class Chunk extends THREE.Object3D {
    constructor (x, z, size, gridSize) {
        super();
        this.x = x;
        this.z = z;
        this.size = size;
        this.gridSize = gridSize;
        this.initialized = false;
        this.name = 'chunk'

        this.heightMap = [];


        for (let x = 0; x <= this.gridSize; x++) {
            this.heightMap[x] = [];
            for (let z = 0; z <= this.gridSize; z++) {
                const normalizedX = x / this.gridSize; // Normalize within the grid
                const normalizedZ = - z / this.gridSize; // Normalize within the grid
        
                const worldX = (this.size * this.x) + (normalizedX * this.size); // Map to world coordinates
                const worldZ = (this.size * this.z) + (normalizedZ * this.size);

                this.heightMap[x][z] = terrain.getY(worldX, worldZ);
            }
        }
        


        this.buildTerrain()


        setTimeout(() => {
            //this.updateBasedOnSeason()
        }, 1000)
    }

    updateBasedOnSeason() {
        if (!this.NatureAssets) return;
        const season = 'winter';
    
        if (season === 'winter') {
            this.NatureAssets.children.forEach(LOD => {
                LOD.traverse(mesh => {
                    if (mesh.isMesh && mesh.geometry) {
                        // Convert to non-indexed geometry for face-based coloring
                        const geometry = mesh.geometry.toNonIndexed();
                        geometry.computeVertexNormals(); // Ensure normals are available
    
                        const positions = geometry.attributes.position.array;
                        const normals = geometry.attributes.normal.array;
                        const faceCount = positions.length / 9; // Each face has 3 vertices (9 values)
                        const colors = new Float32Array(faceCount * 9); // 9 values per face (3 vertices x RGB)
    
                        for (let faceIndex = 0; faceIndex < faceCount; faceIndex++) {
                            // Calculate the face normal (average of the three vertex normals)
                            const normalX = normals[faceIndex * 9];
                            const normalY = normals[faceIndex * 9 + 1];
                            const normalZ = normals[faceIndex * 9 + 2];
    
                            // Determine face color based on normal orientation
                            let color = { r: 0.5, g: 0.5, b: 0.5 }; // Default grey
                            if (normalY > 0.1 && Math.abs(normalX) < 0.8 && Math.abs(normalZ) < 0.8) {
                                color = { r: 1, g: 1, b: 1 }; // Top-facing face: white
                            }
    
                            // Assign the color to all 3 vertices of this face
                            for (let i = 0; i < 3; i++) {
                                const vertexIndex = faceIndex * 9 + i * 3;
                                colors[vertexIndex] = color.r;
                                colors[vertexIndex + 1] = color.g;
                                colors[vertexIndex + 2] = color.b;
                            }
                        }
    
                        // Apply the colors to the geometry
                        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
                        geometry.attributes.color.needsUpdate = true;
    
                        // Use a material that supports face colors
                        mesh.material = new THREE.MeshLambertMaterial({
                            vertexColors: true,
                            flatShading: true, // Ensures no smooth shading between faces
                        });
                    }
                });
            });
        }
    }
    
    

    updateLOD(chunkDistFromPlayer, natureDrawRange) {
        const natureAssets = this.NatureAssets;
        if (chunkDistFromPlayer < natureDrawRange) {
            if (natureAssets === null) {
                this.addNatureAssets();
            }
        } else {
            if (natureAssets !== null) {
                grid.deleteChunkData(this.x, this.z);
                this.remove(natureAssets);
            }
        }
    }

    forEachVertex(callback) {
        const position = this.Collider.geometry.attributes.position;

        for (let i = 0; i < position.count; i += 6) {
            const x = position.array[i * 3];
            const y = position.array[i * 3 + 2];
            const z = position.array[i * 3 + 1];

            callback({
                x: x, 
                y: y, 
                z: -z
            });
        }
    }

    addNatureAssets() {
        let group = new THREE.Group();
        this.forEachVertex(v => {
            const {x, y, z} = v;

            if (y > 3.3 || y < 0.3) return;

            const nature = {
                'trees': [
                    [0.00, 0.0075],
                    [0.025, 0.0325],
                    [0.05, 0.0575],
                    [0.075, 0.0825]
                ],
                'rocks': [
                    [0.1, 0.105]
                ],
                'bushes': [
                    [0.99, 1]
                ]
            };
    
            const RNG = terrain.RNG(
                (this.x * this.size + x) + (z % 7) * 13.37, 
                (this.z * this.size + z) + (x % 5) * 19.91
            );


            let key = '';
            for (const _key_ in nature) {
                for (const [start, end] of nature[_key_]) {
                    if (RNG > start && RNG < end) {
                        const arr = Object.entries(modelData)
                            .filter(([key, value]) => value.path.includes(_key_))
                            .map(([key]) => key);

                        
                        key = arr[Math.floor(terrain.RNG(x, z) * arr.length)];
                        break;
                    }
                }
                if (key) break; // Stop if a match is found
            }
            if (key == '') return;

            const data = modelData[key];

            if (data.needsSpace && !grid.isSpace({x: this.x, z: this.z, size: this.size}, x, z, data.size, data.size)) return;

            const lod = new THREE.LOD();
            const H = new THREE.Group();
            const M = new THREE.Group();
            const L = new THREE.Group();

            const Hmodel = models.getModel(key + '_H');
            Hmodel.forEach(obj => {
                H.add(obj);
            })
            const Mmodel = models.getModel(key + '_M');
            Mmodel.forEach(obj => {
                M.add(obj);
            })
            const Lmodel = models.getModel(key + '_L');
            Lmodel.forEach(obj => {
                L.add(obj);
            })

            const maxRenderDistance = data.maxRenderDistance;
            if (maxRenderDistance > 0) {
                lod.addLevel(new THREE.Object3D(), maxRenderDistance);
            }
            

            if (H.children.length > 0) lod.addLevel(H, data.LOD.H.distance); 
            if (M.children.length > 0) lod.addLevel(M, data.LOD.M.distance);
            if (L.children.length > 0) lod.addLevel(L, data.LOD.L.distance);

            let pos = new THREE.Vector3(...data.position).add(new THREE.Vector3(x, y, z));
            
            lod.position.copy(pos);
            lod.rotation.set(...data.rotation);
            if (data.scale) lod.scale.set(...data.scale);
            else lod.scale.setScalar(1);
            lod.scale.multiplyScalar(data.scaleScalar);
            lod.rotation[data.randomRotation] += Math.random() * 2 * Math.PI;
            lod.updateMatrix();
            lod.matrixAutoUpdate = false;
            group.add(lod);
            grid.registerNewObject({x: this.x, z: this.z}, x, z, data.size, data.size)
        })

        group.name = 'nature_assets';

        this.add(group);
    }
    

    buildTerrain() {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const colors = [];

        const triangleSize = this.size / this.gridSize;

        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const h1 = this.heightMap[i][j];
                const h2 = this.heightMap[i + 1][j];
                const h3 = this.heightMap[i][j + 1];
                const h4 = this.heightMap[i + 1][j + 1];

                const h_1 = (h1 + h2 + h3) / 3;
                const h_2 = (h2 + h3 + h4) / 3;

                const [color1, color2] = terrain.getTerrainColor(h_1, h_2);

                const x = (i * triangleSize) - (this.size / 2);
                const z = (j * triangleSize) - (this.size / 2);

                // Triangle 1 of each grid square
                vertices.push(x, z, h1);
                vertices.push(x + triangleSize, z, h2);
                vertices.push(x, z + triangleSize, h3);

                colors.push(color1.r, color1.g, color1.b);
                colors.push(color1.r, color1.g, color1.b);
                colors.push(color1.r, color1.g, color1.b);

                // Triangle 2 of each grid square
                vertices.push(x + triangleSize, z, h2);
                vertices.push(x + triangleSize, z + triangleSize, h4);
                vertices.push(x, z + triangleSize, h3);

                colors.push(color2.r, color2.g, color2.b);
                colors.push(color2.r, color2.g, color2.b);
                colors.push(color2.r, color2.g, color2.b);
            }
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = - Math.PI / 2;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        mesh.name = 'terrain';

        this.add(mesh)

        setTimeout(() => {
            this.initialized = true;
        }, 100)
    }

    get Collider() {
        let mesh = null;
        this.children.forEach(obj => {
            if (obj.name == 'terrain') {
                mesh = obj;
            }
        })
        return mesh;
    }

    get NatureAssets() {
        let mesh = null;
        this.children.forEach(obj => {
            if (obj.name == 'nature_assets') {
                mesh = obj;
            }
        })
        return mesh;
    }
}