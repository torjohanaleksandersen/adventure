import * as THREE from 'three'
import { createNoise2D } from '../imports/simplex-noise/dist/esm/simplex-noise.js';
import * as COLORS from '../data/colors.js'


const FREQUENZY = 0.02;
const AMPLITUDE = 3;


class Terrain {
    constructor () {
        this.f1 = createNoise2D(); // Main layer
        this.f2 = createNoise2D(); // terrain bumps 1
        this.f3 = createNoise2D(); // terrain bumps 2
        this.f4 = createNoise2D(); // mountain
        this.f5 = createNoise2D(); // mountain bumps
    }

    getBiomeValue(x, z) {
        const broad = this.f1(x * 0.002, z * 0.002) + 0.5;

        const base = this.f2(x * 0.02, z * 0.02) * 0.2;

        let biomeValue = broad + base;
        return Math.max(0, Math.min(1, biomeValue));
    }
    
    getBiome(x, z) {
        const value = this.getBiomeValue(x, z);
    
        // Map ranges to distinct biomes
        if (value < 0.2) return 'sand';
        if (value < 0.8) return 'forest';
        if (value < 1) return 'spruce';
    }

    getY(x, z) {
        x *= FREQUENZY;
        z *= FREQUENZY;


        const base = this.f1(x, z);
        const bump1 = this.f2(x* 10, z* 10) * 0.1;
        const bump2 = this.f3(x * 2, z * 2) * 0.1;

        let mountains = Math.pow(this.f4(x * 0.6, z * 0.6), 8) * 8;
        const mountainBumps = this.f5(x * 10, z * 10) * 0.6;
        if (mountains > 2) mountains += mountainBumps;

        //base + bump1 + bump2 + mountains
        return (base + bump1 + bump2 + mountains) * AMPLITUDE;
    }

    RNG(x, z) {
        const seed = x * 0x1f1f1f1f + z * 0x1f1f1f1f;

        const hash = (seed ^ (seed >>> 16)) * 0x45d9f3b;
        const result = (hash ^ (hash >>> 16)) * 0x45d9f3b;

        return (result & 0xFFFFFFF) / 0xFFFFFFF;
    }

    getColor(typeTerrain = '', rng) {
        if (typeof typeTerrain != 'string') return typeTerrain[Math.floor(rng * typeTerrain.length)]
        return COLORS[typeTerrain][Math.floor(rng * COLORS[typeTerrain].length)];
    }

    getTerrainColor(h_1, h_2, season = 'summer', rng) {
        const grassLevel = 0.5 + (rng * 0.02 - 0.01);
        const mountainLevel = 6 + (rng * 2 - 3);
        const snowlevel = 20 + (rng * 3 - 2);

        let color1 = new THREE.Color();
        let color2 = new THREE.Color();

        if (h_1 > snowlevel) {
            color1.setHex(terrain.getColor('snow', rng))
        } else if (h_1 > mountainLevel) {
            color1.setHex(terrain.getColor('stone', rng))
        } else if (h_1 > mountainLevel - 1) {
            color1.setHex(terrain.getColor('grassStone', rng))
        } else if (h_1 > grassLevel) {
            color1.setHex(terrain.getColor(COLORS.grass[season], rng)); //grass
        } else if (h_1 > grassLevel - 0.2) {
            color1.setHex(terrain.getColor('sandGrass', rng))
        } else {
            color1.setHex(terrain.getColor('sand', rng));
        }

        if (h_2 > snowlevel) {
            color2.setHex(terrain.getColor('snow', 1 - rng))
        } else if (h_2 > mountainLevel) {
            color2.setHex(terrain.getColor('stone', 1 - rng))
        } else if (h_2 > mountainLevel - 1) {
            color2.setHex(terrain.getColor('grassStone', 1 - rng))
        } else if (h_2 > grassLevel) {
            color2.setHex(terrain.getColor(COLORS.grass[season], 1 - rng)); //grass
        } else if (h_2 > grassLevel - 0.2) {
            color2.setHex(terrain.getColor('sandGrass', 1 - rng))
        } else {
            color2.setHex(terrain.getColor('sand', 1 - rng));
        }

        return [ color1, color2 ];
    }

    getCanopyColor(season) {
        const arr = COLORS.canopyColors[season];
        return arr[Math.floor(Math.random() * arr.length)]
    }
}

export const terrain = new Terrain()