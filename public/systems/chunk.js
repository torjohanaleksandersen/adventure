import * as THREE from 'three'
import { terrain } from './terrain.js';
import { models } from '../main.js';
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

        for (let i = 0; i < position.count; i += 3) {
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
        this.forEachVertex(v => {
            const {x, y, z} = v;

            if (y > 3 || y < 1) return;

            const nature = {
                'Tree0': [0.0, 0.005],
                'Tree1': [0.005, 0.010],
                'Rock0': [0.015, 0.03],
            }

            const RNG = terrain.RNG(this.x * this.size + x, this.z * this.size + z)

            let key = ''
            for (const _key_ in nature) {
                if (RNG > nature[_key_][0] && RNG < nature[_key_][1]) {
                    key = _key_;
                }
            }
            if (key == '') return;

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


            lod.addLevel(H, 50);
            lod.addLevel(M, 60);
            lod.addLevel(L, 70);


            let pos = new THREE.Vector3(...modelData[key].position).add(new THREE.Vector3(x, y, z));
            lod.position.copy(pos);
            lod.scale.setScalar(modelData[key].scaleScalar);
            lod.rotation.y = Math.random() * 2 * Math.PI;
            lod.updateMatrix();
            lod.matrixAutoUpdate = false;
            this.add(lod);
        })
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
            this.initialized = true;
            this.addNatureAssets()
        }, 100)
    }

    get Collider() {
        return this.children[0]
    }
}