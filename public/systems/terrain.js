import * as THREE from 'three'
import { createNoise2D } from '../imports/simplex-noise/dist/esm/simplex-noise.js';

/* const grass = [
    0x11330e, // Base color
    0x0f2e0c, // Darker, less red
    0x0e2f0e, // Slightly more green
    0x12330d, // Slightly brighter
    0x10320f, // A bit more blue
    0x0f330d, // Slightly less green
    0x12310f, // Redder shade
    0x0e2d0f, // A bit lighter
    0x0d2f10, // Darker, more neutral
    0x13330f, // Slightly richer
];
 */
const grass = [
    0x194417, // Base color, slightly lighter
    0x153a11, // Darker, less red, but lighter than original
    0x143a14, // Slightly more green and brighter
    0x1a4516, // Slightly brighter
    0x174018, // A bit more blue and brighter
    0x154515, // Slightly less green but brighter
    0x1a4018, // Redder shade and lighter
    0x143815, // A bit lighter
    0x133a18, // Darker, more neutral, but lighter
    0x1b4518, // Slightly richer and lighter
];

const sand = [
    0xedf28d, // Base color
    0xe3e182, // Slightly darker, less yellow
    0xf0e88b, // A little brighter, more yellow
    0xe1d684, // More neutral, less saturated
    0xf1e15c, // More golden tone
    0xf0d87a, // Slightly darker and more brown
    0xe8d77e, // A bit more muted
    0xd9c56a, // More earthy tone
    0xf4e4a0, // Lighter and warmer
    0xe4d68d, // Slightly richer, more yellow-orange
];

const sandGrassTransition = [
    0x1f4119, // A mix of dark green and light sand
    0x4d5632, // Earthy olive with a hint of warmth
    0x55662b, // Slightly greenish sand
    0x6c763d, // Earthy brown-green blend
    0x736c3f, // Muted green with a hint of yellow
    0x4f5b39, // Balanced olive and light sand
    0x5a5b3b, // More muted green, with sand undertones
    0x8b7d48, // More yellow, leaning towards sand
    0x6e7542, // Olive green with some golden warmth
    0x7f6b4f, // Warm, earthy blend with some greenish tones
];

const stone = [
    0x8a8a8a, // Base stone color
    0x787878, // Slightly darker gray
    0x9b9b9b, // Slightly lighter gray
    0x7f7f7f, // Cooler gray tone
    0x8f8f8f, // A bit warmer gray
    0x6e6e6e, // Darker, more neutral gray
    0x949494, // Lighter gray, still earthy
    0x858585, // Neutral gray, subtle blue tone
    0x929292, // Light, neutral gray
    0x818181, // Darker with a bit of depth
];

const snow = [
    0xf0f8ff, // Light snowy white with a hint of blue
    0xe6f2ff, // Very light blue, shadowed snow
    0xf8f9fa, // Almost pure white
    0xfafafa, // Neutral white
    0xeaeaea, // Soft grayish white
    0xdedfe1, // Light gray for shaded snow
    0xd8e4f0, // Icy blue hint
    0xcfd8e1, // Grayish blue
    0xbfc9d6, // Light blue-gray, deep shadow snow
    0xaab4c4  // Slightly darker, cool shadowed snow
];

const grassStoneTransition = [
    0x11330e, // Dark forest green (grass base)
    0x2e4f23, // Earthy green
    0x4a6738, // Faded green with brown hint
    0x6e7e56, // Olive green-brown, beginning to mix with stone
    0x8d8b72, // Greenish-gray, intermediary between grass and stone
    0x8a8a8a, // Light stone gray, blending into rock
    0x787878, // Mid-gray, primary stone color
    0x656565, // Dark gray, shadowed stone
    0x505050, // Deep gray with slight green undertone for mossy stone
    0x3d3d3d  // Dark rock gray, fully stone area
];

class Terrain {
    constructor () {
        this.f1 = createNoise2D(); // Main layer
        this.f2 = createNoise2D(); // terrain bumps 1
        this.f3 = createNoise2D(); // terrain bumps 2
        this.f4 = createNoise2D(); // mountain
        this.f5 = createNoise2D(); // mountain bumps
    }

    getY(x, z) {
        const base = this.f1(x, z);
        const bump1 = this.f2(x* 10, z* 10) * 0.1;
        const bump2 = this.f3(x * 2, z * 2) * 0.1;
        let mountains = Math.pow(this.f4(x * 0.6, z * 0.6), 8) * 8;
        const mountainBumps = this.f5(x * 10, z * 10) * 0.6;
        if (mountains > 2) mountains += mountainBumps;

        //base + bump1 + bump2 + mountains
        return base + bump1 + bump2 + mountains
    }

    RNG(x, z) {
        const seed = x * 0x1f1f1f1f + z * 0x1f1f1f1f;

        const hash = (seed ^ (seed >>> 16)) * 0x45d9f3b;
        const result = (hash ^ (hash >>> 16)) * 0x45d9f3b;

        return (result & 0xFFFFFFF) / 0xFFFFFFF;
    }
    
    

    getColor(typeTerrain = '') {
        if (typeTerrain === 'grass') {
            return grass[Math.floor(Math.random() * grass.length)]
        } else if (typeTerrain === 'sand') {
            return sand[Math.floor(Math.random() * sand.length)]
        } else if (typeTerrain == 'stone') {
            return stone[Math.floor(Math.random() * stone.length)]
        } else if (typeTerrain == 'mix_sand-grass') {
            return sandGrassTransition[Math.floor(Math.random() * sandGrassTransition.length)]
        } else if (typeTerrain == 'snow') {
            return snow[Math.floor(Math.random() * snow.length)]
        } else if (typeTerrain == 'mix_grass-stone') {
            return grassStoneTransition[Math.floor(Math.random() * grassStoneTransition.length)]
        }
        return null;
    }
}

export const terrain = new Terrain()