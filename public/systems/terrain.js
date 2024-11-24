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
        // Broad biome regions (large scale)
        const base = this.f1(x * 0.001, z * 0.001) * 0.7; 
    
        // Add medium-scale modulation for variation within biomes
        const modulation = this.f3(x * 0.008, z * 0.008) * 0.2; 
    
        // Fine-grain detail for localized variation
        const detail = this.f4(x * 0.03, z * 0.03) * 0.1;
    
        // Additional layer to break symmetry and add unique features
        const feature = this.f5(x * 0.01, z * 0.01) * 0.15;
    
        // Blend layers with weights
        const biomeValue = base + modulation + detail + feature;
    
        // Normalize the final value to range [-1, 1]
        return Math.max(-1, Math.min(1, biomeValue));
    }

    getBiome() {

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
    
    

    getColor(typeTerrain = '') {
        if (typeTerrain === 'grass') {
            return COLORS.grass[Math.floor(Math.random() * COLORS.grass.length)]
        } else if (typeTerrain === 'sand') {
            return COLORS.sand[Math.floor(Math.random() * COLORS.sand.length)]
        } else if (typeTerrain == 'stone') {
            return COLORS.stone[Math.floor(Math.random() * COLORS.stone.length)]
        } else if (typeTerrain == 'mix_sand-grass') {
            return COLORS.sandGrassTransition[Math.floor(Math.random() * COLORS.sandGrassTransition.length)]
        } else if (typeTerrain == 'snow') {
            return COLORS.snow[Math.floor(Math.random() * COLORS.snow.length)]
        } else if (typeTerrain == 'mix_grass-stone') {
            return COLORS.grassStoneTransition[Math.floor(Math.random() * COLORS.grassStoneTransition.length)]
        }
        return null;
    }

    getTerrainColor(h_1, h_2) {
        const grassLevel = 0.5 + (Math.random() * 0.02 - 0.01);
        const mountainLevel = 5 + (Math.random() * 0.5 - 1);
        const snowlevel = 20 + (Math.random() * 3 - 2);

        let color1 = new THREE.Color();
        let color2 = new THREE.Color();

        if (h_1 > snowlevel) {
            color1.setHex(terrain.getColor('snow'))
        } else if (h_1 > mountainLevel) {
            color1.setHex(terrain.getColor('stone'))
        } else if (h_1 > mountainLevel - 1) {
            color1.setHex(terrain.getColor('mix_grass-stone'))
        } else if (h_1 > grassLevel) {
            color1.setHex(terrain.getColor('snow')); //grass
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
            color2.setHex(terrain.getColor('snow')); //grass
        } else if (h_2 > grassLevel - 0.2) {
            color2.setHex(terrain.getColor('mix_sand-grass'))
        } else {
            color2.setHex(terrain.getColor('sand'));
        }

        return [ color1, color2 ];
    }

    getCanopyColor(season) {
        const arr = COLORS.canopyColors[season];
        return arr[Math.floor(Math.random() * arr.length)]
    }
}

export const terrain = new Terrain()