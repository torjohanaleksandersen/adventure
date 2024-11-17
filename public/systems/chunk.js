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
                const frequency = 0.015;
                const amplitude = 3;
                const worldX = (this.gridSize * this.x) + x;
                const worldZ = (this.gridSize * this.z) - z;

                this.heightMap[x][z] = terrain.getY(worldX * frequency, worldZ * frequency) * amplitude;
            }
        }


        this.buildTerrain()
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
                    //[0.05, 0.0575],
                    //[0.075, 0.0825]
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
                        key = arr[Math.floor(Math.random() * arr.length)];
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
            lod.scale.setScalar(data.scaleScalar);
            lod.rotation.y += Math.random() * 2 * Math.PI;
            lod.updateMatrix();
            lod.matrixAutoUpdate = false;
            group.add(lod);
            grid.registerNewObject({x: this.x, z: this.z}, x, z, data.size, data.size)
        })

        this.add(group);

        setTimeout(() => {
            this.initialized = true;
        }, 100)
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
                const h_2 = (h2 + h3 + h4) / 3

                const grassLevel = 0.5 + (Math.random() * 0.02 - 0.01);
                const mountainLevel = 5 + (Math.random() * 0.5 - 1);
                const snowlevel = 20 + (Math.random() * 0.5 - 1);

                let color1 = new THREE.Color();
                let color2 = new THREE.Color();

                if (h_1 > snowlevel) {
                    color1.setHex(terrain.getColor('snow'))
                } else if (h_1 > mountainLevel) {
                    color1.setHex(terrain.getColor('stone'))
                } else if (h_1 > mountainLevel - 1) {
                    color1.setHex(terrain.getColor('mix_grass-stone'))
                } else if (h_1 > grassLevel) {
                    color1.setHex(terrain.getColor('grass'));
                } else if (h_1 > grassLevel - 0.2) {
                    color1.setHex(terrain.getColor('mix_sand-grass'))
                } else {
                    color1.setHex(terrain.getColor('sand'));
                }

                if (h_2 > snowlevel) {
                    color2.setHex(terrain.getColor('snow'))
                } else if (h_2 > mountainLevel) {
                    color2.setHex(terrain.getColor('stone'))
                } else if (h_2 > mountainLevel - 1) {
                    color2.setHex(terrain.getColor('mix_grass-stone'))
                } else if (h_2 > grassLevel) {
                    color2.setHex(terrain.getColor('grass'));
                } else if (h_2 > grassLevel - 0.2) {
                    color2.setHex(terrain.getColor('mix_sand-grass'))
                } else {
                    color2.setHex(terrain.getColor('sand'));
                }

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

        this.add(mesh)

        setTimeout(() => {
            this.addNatureAssets()
        }, 100)
    }

    get Collider() {
        return this.children[0]
    }

    get CollidableAssets() {
        return this.children[1];
    }
}