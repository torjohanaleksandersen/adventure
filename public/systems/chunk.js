import * as THREE from 'three'
import * as COLORS from '../data/colors.js'
import { terrain } from './terrain.js';
import { grid, LODmodels, time, weather } from '../main.js';
import { LODModelsData } from '../data/models.js'



export class Chunk extends THREE.Object3D {
    constructor (x, z, size, gridSize) {
        super();
        this.x = x;
        this.z = z;
        this.size = size;
        this.gridSize = gridSize;
        this.initialized = false;
        this.name = 'chunk';
        this.snowLevel = -1;

        this.currentUpdate = {
            season: time.getSeasonData().season,
            dayOrNight: time.isNight ? 'night' : 'day',
        }

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

        time.addEventListener('day-change', () => {
            this.updateSeasonalColors();
        })

        setTimeout(() => {
            this.addSnow();
        }, 1000)
    }
    
    addWireframe() {
        this.traverse((obj) => {
            if (obj.isMesh) {
                const wireframeGeometry = new THREE.WireframeGeometry(obj.geometry);
    
                const wireframeMaterial = new THREE.LineBasicMaterial({
                    color: 0x000000,
                    linewidth: 1,
                    toneMapped: false
                });
    
                const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
                wireframe.name = "wireframe"

                wireframe.raycast = () => {};
    
                obj.add(wireframe);
            }
        });
    }

    removeWireframe() {
        this.traverse((obj) => {
            if (obj.isMesh) {
                const wireframe = obj.getObjectByName("wireframe");
                if (!wireframe) return;
                obj.remove(wireframe);
            }
        })
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

    forEachNatureAsset(callback) {
        this.NatureAssets.children.forEach(LOD => {
            LOD.traverse(level => {
                level.traverse(obj => {
                    if (obj.isMesh) {
                        callback(obj);
                    }
                })
            })
        })
    }

    addNatureAssets() {
        if (this.NatureAssets) this.remove(this.NatureAssets);

        let group = new THREE.Group();
        this.forEachVertex(v => {
            const {x, y, z} = v;

            if (y > 3.3 || y < 0.3) return;

            const nature = {
                'trees': [
                    /*
                    [0.00, 0.0075],
                    [0.025, 0.0325],
                    [0.05, 0.0575],
                    [0.075, 0.0825]
                    */
                    [0, 0.032]
                ],
                'rocks': [
                    /*
                    [0.1, 0.105],
                    [0.2, 0.205],
                    [0.3, 0.305],
                    */
                    [0.2, 0.22]
                ],
                'bushes': [
                    /*
                    [0.4, 0.41],
                    [0.5, 0.51],
                    [0.6, 0.61],
                    */
                    [0.3, 0.35]
                ]
            };
    
            const RNG = terrain.RNG(
                (this.x * this.size + x) + (z % 7) * 13.37, 
                (this.z * this.size + z) + (x % 5) * 19.91
            );

            let typeFlag = 'temperate';
            if (weather.snowOnNatureAssets) {
                typeFlag = 'snow';
            }


            let key = '';
            for (const _key_ in nature) {
                for (const [start, end] of nature[_key_]) {
                    if (RNG > start && RNG < end) {
                        const arr = Object.entries(LODModelsData)
                        .filter(([key, value]) => value.path.includes(_key_) && key.includes(typeFlag))
                        .map(([key]) => key);

                        
                        key = arr[Math.floor(terrain.RNG(x, z) * arr.length)];
                        break;
                    }
                }
                if (key) break; // Stop if a match is found
            }
            if (key == '' ||!key) return;

            const data = LODModelsData[key];

            if (data.needsSpace && !grid.isSpace({x: this.x, z: this.z, size: this.size}, x, z, data.size, data.size)) return;

            const lod = new THREE.LOD();
            const H = new THREE.Group();
            const M = new THREE.Group();
            const L = new THREE.Group();

            const Hmodel = LODmodels.getModel(key + '_H');
            Hmodel.forEach(obj => {
                H.add(obj);
            })
            const Mmodel = LODmodels.getModel(key + '_M');
            Mmodel.forEach(obj => {
                M.add(obj);
            })
            const Lmodel = LODmodels.getModel(key + '_L');
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
            if (data.randomRotation != ' ') lod.rotation[data.randomRotation] += terrain.RNG(x, z) * 2 * Math.PI;
            lod.updateMatrix();
            lod.matrixAutoUpdate = false;
            group.add(lod);
            grid.registerNewObject({x: this.x, z: this.z}, x, z, data.size, data.size)
        })

        group.name = 'nature_assets';

        this.add(group);
        this.updateSeasonalColors();

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

    addSnow() {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const colors = [];
    
        const triangleSize = this.size / this.gridSize;
    
        // Precompute random height offsets
        const heightOffsets = [];
        for (let i = 0; i <= this.gridSize; i++) {
            heightOffsets[i] = [];
            for (let j = 0; j <= this.gridSize; j++) {
                let k = terrain.RNG(
                    (this.x * this.size + i) + (j % 7) * 13.37 + 1,
                    (this.z * this.size + j) + (i % 5) * 19.91 + 1
                ) * 0.2;
                if (i == 0 || j == 0 || i == this.gridSize || j == this.gridSize) k = 0;
                heightOffsets[i][j] = k;
            }
        }
    
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                let h1 = this.heightMap[i][j] + heightOffsets[i][j];
                let h2 = this.heightMap[i + 1][j] + heightOffsets[i + 1][j];
                let h3 = this.heightMap[i][j + 1] + heightOffsets[i][j + 1];
                let h4 = this.heightMap[i + 1][j + 1] + heightOffsets[i + 1][j + 1];
    
                const c = new THREE.Color(terrain.getColor("snow"));
    
                const x = (i * triangleSize) - (this.size / 2);
                const z = (j * triangleSize) - (this.size / 2);
    
                // Triangle 1 of each grid square
                vertices.push(x, z, h1);
                vertices.push(x + triangleSize, z, h2);
                vertices.push(x, z + triangleSize, h3);
    
                colors.push(c.r, c.g, c.b);
                colors.push(c.r, c.g, c.b);
                colors.push(c.r, c.g, c.b);
    
                // Triangle 2 of each grid square
                vertices.push(x + triangleSize, z, h2);
                vertices.push(x + triangleSize, z + triangleSize, h4);
                vertices.push(x, z + triangleSize, h3);
    
                colors.push(c.r, c.g, c.b);
                colors.push(c.r, c.g, c.b);
                colors.push(c.r, c.g, c.b);
            }
        }
    
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
        const material = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
    
        mesh.position.y = this.snowLevel;
        mesh.name = 'snow-layer';
    
        this.add(mesh);
    }
    

    updateSeasonalColors() {
        const {season, progress} = time.getSeasonData()
        const seasonOrder = ['spring', 'summer', 'autumn', 'winter'];
        const currentIndex = seasonOrder.indexOf(season);
        const nextSeason = seasonOrder[(currentIndex + 1) % seasonOrder.length];

        const triangleSize = this.size / this.gridSize;

        if (this.Collider) {
            const geometry = this.Collider.geometry
            const colors = [];

    
            for (let i = 0; i < this.gridSize; i++) {
                for (let j = 0; j < this.gridSize; j++) {
                    const h1 = this.heightMap[i][j];
                    const h2 = this.heightMap[i + 1][j];
                    const h3 = this.heightMap[i][j + 1];
                    const h4 = this.heightMap[i + 1][j + 1];
    
                    const h_1 = (h1 + h2 + h3) / 3;
                    const h_2 = (h2 + h3 + h4) / 3;

                    const x = (i * triangleSize) - (this.size / 2);
                    const z = (j * triangleSize) - (this.size / 2);
    
                    const RNG = terrain.RNG(
                        (this.x * this.size + x) + (z % 7) * 13.37, 
                        (this.z * this.size + z) + (x % 5) * 19.91
                    );
                    
                    const [color1, color2] = terrain.getTerrainColor(h_1, h_2, season, RNG);
                    const [nextColor1, nextColor2] = terrain.getTerrainColor(h_1, h_2, nextSeason, RNG);

                    const result1 = color1.clone().lerp(nextColor1, progress)
                    const result2 = color2.clone().lerp(nextColor2, progress)

    
                    colors.push(result1.r, result1.g, result1.b);
                    colors.push(result1.r, result1.g, result1.b);
                    colors.push(result1.r, result1.g, result1.b);
    
                    colors.push(result2.r, result2.g, result2.b);
                    colors.push(result2.r, result2.g, result2.b);
                    colors.push(result2.r, result2.g, result2.b);
                }
            }
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        }

        if (this.NatureAssets) {
    
            this.NatureAssets.children.forEach(LOD => {
                const color = new THREE.Color(COLORS.canopyColors[season][Math.floor(terrain.RNG(this.x * this.size + LOD.position.x, this.z * this.size + LOD.position.z) * COLORS.canopyColors[season].length)]);
                const nextColor = new THREE.Color(COLORS.canopyColors[nextSeason][Math.floor(terrain.RNG(this.x * this.size + LOD.position.x, this.z * this.size + LOD.position.z) * COLORS.canopyColors[nextSeason].length)]);
                
                const result = color.clone().lerp(nextColor, progress);
                
                LOD.levels.forEach(level => {
                    level.object.traverse(obj => {
                        if (obj.material && (obj.material.name.includes("Autum") || obj.material.name.includes("green"))) { // Trees or bush
                            obj.material = obj.material.clone();
                            obj.material.color = result;
                            obj.material.needsUpdate = true;
                        }
                    })
                })
            })
        }
    }

    update() {
        if (this.snowLevel != weather.snowLevel) {
            const snowLayer = this.getObjectByName("snow-layer")
            if (!snowLayer) return;
            snowLayer.position.y = weather.snowLevel;
            this.snowLevel = weather.snowLevel;
        }
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