import * as THREE from 'three'

class LODmodel {
    constructor() {
        this.position = [0, 0, 0];
        this.rotation = [0, 0, 0];
        this.scale = [1, 1, 1];
        this.scaleScalar = 1;
        this.randomRotation = 'y';
        this.path = '/';
        this.maxRenderDistance = 150;
        this.size = 3;
        this.needsSpace = true;
        this.LOD = {
            H: {
                distance: 0,
                geometry: 1,
            },
            M: {
                distance: 30,
                geometry: 0.4,
            },
            L: {
                distance: 60,
                geometry: 0.7,
            }
        }
    }
}

class PineTree extends LODmodel {
    constructor (y = 2.8) {
        super();
        this.position = [0, y, 0];
        this.rotation = [-Math.PI / 2, 0, 0];
        this.scale = [1, 1, 5];
        this.scaleScalar = 0.8;
        this.randomRotation = 'z';
        this.path = 'trees/';
        this.LOD = {
            H: {
                distance: 0,
                geometry: 1,
            },
        }
    }
}

class Tree extends LODmodel {
    constructor (scale, y) {
        super();
        this.position = [0, y, 0];
        this.rotation = [-Math.PI / 2, 0, 0];
        this.scale = [1, 1, 1];
        this.scaleScalar = scale;
        this.randomRotation = 'z';
        this.path = 'trees/';
        this.LOD = {
            H: {
                distance: 0,
                geometry: 1,
            },
        }
    }
}

class TreeNoLeaves extends LODmodel {
    constructor (scale = 1) {
        super();
        this.position = [0, 2.2, 0];
        this.rotation = [-Math.PI / 2, 0, 0];
        this.scale = [1, 1, 1];
        this.scaleScalar = scale;
        this.randomRotation = 'z';
        this.path = 'trees/';
        this.LOD = {
            H: {
                distance: 0,
                geometry: 1,
            },
        }
    }
}

class Rock extends LODmodel {
    constructor () {
        super();
        this.path = 'rocks/';
        this.rotation = [-Math.PI / 2, 0, 0];
        this.randomRotation = 'z';
        this.scale = [1, 1, 1];
        this.size = 3;
        this.LOD = {
            H: {
                distance: 0,
                geometry: 1,
            },
        }
    }
}


class Bush extends LODmodel {
    constructor (x = 0, z = 0) {
        super();
        this.path = 'bushes/'
        this.size = 7;
        this.randomRotation = ' '
        this.rotation = [-Math.PI / 2, 0, 0]
        this.position = [x, -0.5, z]
        this.LOD = {
            H: {
                distance: 0,
                geometry: 1,
            },
        }
    }
}


export const LODModelsData = {
    'pine-tree-1-temperate': new PineTree(),
    'pine-tree-1-snow': new PineTree(),
    'pine-tree-2-temperate': new PineTree(),
    'pine-tree-2-snow': new PineTree(),
    'pine-tree-3-temperate': new PineTree(2.4),
    'pine-tree-3-snow': new PineTree(),

    'rock-1-temperate': new Rock(),
    'rock-1-snow': new Rock(),
    'rock-2-temperate': new Rock(),
    'rock-2-snow': new Rock(),
    'rock-3-temperate': new Rock(),
    'rock-3-snow': new Rock(),
    
    'tree-1-temperate': new Tree(0.4, 3.4),
    'tree-2-temperate': new Tree(0.2, 3.5),
    'tree-3-temperate': new Tree(0.4, 3.6),

    'tree-no-leaves-snow-1': new TreeNoLeaves(0.4),
    'tree-no-leaves-snow-2': new TreeNoLeaves(0.2),
    'tree-no-leaves-snow-3': new TreeNoLeaves(0.5),
    
    'bush-1-temperate': new Bush(),
    'bush-2-temperate': new Bush(-3, 2),
    'bush-3-temperate': new Bush(),
}


class Model {
    constructor(position = new THREE.Vector3(0, 0, 0), rotation = new THREE.Vector3(0, 0, 0), scaleScalar = 1, userData = {}) {
        this.position = position;
        this.rotation = rotation;
        this.scaleScalar = scaleScalar;
        this.userData = userData;
    }
}


export const modelsData = {
    weapon: {
        axe: new Model(new THREE.Vector3(0, 0.0012, -0.0002), new THREE.Vector3(Math.PI, 0, Math.PI / 2), 0.002),
        sword: new Model(new THREE.Vector3(0, 0.0012, -0.0002), new THREE.Vector3(Math.PI, 0, Math.PI / 2), 0.003),
        knife: new Model(new THREE.Vector3(0, 0.0012, -0.0002), new THREE.Vector3(Math.PI, 0, Math.PI / 2), 0.002),
        shovel: new Model(new THREE.Vector3(0.001, 0.0012, -0.0002), new THREE.Vector3(Math.PI, 0, Math.PI / 2), 0.002),
    },
    items: {
        torch: new Model(new THREE.Vector3(0, 0.0012, -0.0002), new THREE.Vector3(Math.PI, 0, Math.PI / 2), 0.0025, {state: 0}),
        paper: new Model(new THREE.Vector3(-0.0015, 0.0015, -0.0002), new THREE.Vector3(2, 0, 0.3), 0.005),
    },
    objects: {
        campfire: new Model(),
    }
}