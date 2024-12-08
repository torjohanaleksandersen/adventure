class Model {
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

class PineTree extends Model {
    constructor () {
        super();
        this.position = [0, 2.8, 0];
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

class Tree extends Model {
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

class TreeNoLeaves extends Model {
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

class Rock extends Model {
    constructor () {
        super();
        this.path = 'rocks/';
        this.rotation = [-Math.PI / 2, 0, 0];
        this.randomRotation = 'z';
        this.scale = [1, 1, 1];
        this.size = 3;
    }
}


class Bush extends Model {
    constructor (x = 0, z = 0) {
        super();
        this.path = 'bushes/'
        this.size = 7;
        this.randomRotation = ' '
        this.rotation = [-Math.PI / 2, 0, 0]
        this.position = [x, -0.5, z]
    }
}


export const modelData = {
    /*
    'big-round-tree': {
        position: [0, 2, 0],
        rotation: [0, 0, 0],
        scaleScalar: 5,
        randomRotation: 'y',
        path: 'trees/',
        maxRenderDistance: 150,
        size: 3,
        needsSpace: true,
        LOD: {
            H: {
                distance: 0,
                geometry: 1,
            },
            M: {
                distance: 50,
                geometry: 0.4,
            },
            L: {
                distance: 100,
                geometry: 0.6
            }
        }
    },
    */
    
    
    'pine-tree-1-temperate': new PineTree(),
    //'pine-tree-1-snow': new PineTree(),
    'pine-tree-2-temperate': new PineTree(),
    //'pine-tree-2-snow': new PineTree(),
    'pine-tree-3-temperate': new PineTree(),
    //'pine-tree-3-snow': new PineTree(),

    'rock-1-temperate': new Rock(),
    //'rock-1-snow': new Rock(),
    'rock-2-temperate': new Rock(),
    //'rock-2-snow': new Rock(),
    'rock-3-temperate': new Rock(),
    //'rock-3-snow': new Rock(),
    
    
    'tree-1-temperate': new Tree(0.4, 3.4),
    'tree-2-temperate': new Tree(0.2, 3.5),
    'tree-3-temperate': new Tree(0.4, 3.6),

    //'tree-no-leaves-snow-1': new TreeNoLeaves(0.4),
    //'tree-no-leaves-snow-2': new TreeNoLeaves(0.2),
    //'tree-no-leaves-snow-3': new TreeNoLeaves(0.5),

    
    'bush-1': new Bush(),
    'bush-2': new Bush(-3, 2),
    'bush-3': new Bush(),
    
    
    

    
    /*
     
    'dead-tree': {
        position: [0, 3, 0],
        rotation: [0, 0, 0],
        scaleScalar: 3,
        randomRotation: 'y',
        path: 'trees/',
        maxRenderDistance: 150,
        size: 3,
        needsSpace: true,
        LOD: {
            H: {
                distance: 0,
                geometry: 1,
            },
            M: {
                distance: 50,
                geometry: 0.4,
            },
            L: {
                distance: 100,
                geometry: 0.8
            }
        }
    },
    */
    
    /*
    'google-standard-tree': {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scaleScalar: 0.01,
        randomRotation: 'y',
        path: 'trees/',
        maxRenderDistance: 150,
        size: 3,
        needsSpace: true,
        LOD: {
            H: {
                distance: 0,
                geometry: 1,
            },
            M: {
                distance: 50,
                geometry: 0.4,
            },
            L: {
                distance: 100,
                geometry: 0.6
            }
        }
    },
    
    'orange-tree': {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scaleScalar: 0.5,
        randomRotation: 'y',
        path: 'trees/',
        maxRenderDistance: 150,
        size: 3,
        needsSpace: true,
        LOD: {
            H: {
                distance: 0,
                geometry: 1,
            },
            M: {
                distance: 50,
                geometry: 0.7,
            },
            L: {
                distance: 100,
                geometry: 0.9
            }
        }
    },
    */
    /*
    'small-rock': {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scaleScalar: 3,
        randomRotation: 'y',
        path: 'rocks/',
        maxRenderDistance: 40,
        size: 1,
        needsSpace: false,
        LOD: {
            H: {
                distance: 0,
                geometry: 1,
            },
            M: {
                distance: 20,
                geometry: 0.5,
            },
        }
    },
    */
    
    /*
    'big-rock': {
        position: [0, 10, 0],
        rotation: [0, 0, 0],
        scaleScalar: 100,
        randomRotation: 'y',
        path: 'rocks/',
        maxRenderDistance: 100,
        size: 1,
        needsSpace: false,
        LOD: {
            H: {
                distance: 0,
                geometry: 1,
            },
            M: {
                distance: 40,
                geometry: 0.5,
            },
            L: {
                distance: 100,
                geometry: 0.8
            }
        }
    },
    */
    /*
    'small-bush-1': {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scaleScalar: 0.01,
        randomRotation: 'y',
        path: 'bushes/',
        maxRenderDistance: 40,
        size: 3,
        needsSpace: false,
        LOD: {
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
    },
    'small-bush-2': {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scaleScalar: 0.01,
        randomRotation: 'y',
        path: 'bushes/',
        maxRenderDistance: 40,
        size: 3,
        needsSpace: false,
        LOD: {
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
    },
    'bush-asset-1': {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scaleScalar: 0.01,
        randomRotation: 'y',
        path: 'bushes/',
        maxRenderDistance: 40,
        size: 3,
        needsSpace: false,
        LOD: {
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
    },
    'bush-asset-2': {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scaleScalar: 0.01,
        randomRotation: 'y',
        path: 'bushes/',
        maxRenderDistance: 40,
        size: 3,
        needsSpace: false,
        LOD: {
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
    },
    'bush-asset-3': {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scaleScalar: 0.01,
        randomRotation: 'y',
        path: 'bushes/',
        maxRenderDistance: 40,
        size: 3,
        needsSpace: false,
        LOD: {
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
    },
    */
}