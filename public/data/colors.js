const grass = [
    0x4B7A36, // Muted Grass Green
    0x4E8238, // Balanced Grass Green
    0x507B3A, // Slightly Darker Green
    0x487235, // Deep Grass Green
    0x4C7937, // Mild Grass Green
    0x527F39, // Balanced with a Slightly Brighter Tone
    0x497635, // Natural Grass Green
    0x4A7836, // Subtle Variation of Green
];

const sand = [
    0xC2B280, // Warm Beige Sand
    0xC5B78E, // Light Sand
    0xCAB88F, // Soft Sandy Tan
    0xBFAF7A, // Muted Sandy Yellow
    0xD1C29D, // Pale Sand
    0xC7B896, // Balanced Sand Tone
    0xC4B084, // Neutral Sand
    0xC9B48A, // Slightly Warmer Sand
];

const stone = [
    0x6E6E6E, // Medium Gray Stone
    0x707070, // Slightly Warmer Gray
    0x6A6A6A, // Balanced Dark Gray
    0x686868, // Cool Dark Gray
    0x727272, // Soft Neutral Gray
    0x696969, // Muted Mountain Gray
    0x747474, // Slightly Lighter Gray
    0x6C6C6C, // Subtle Midtone Gray
];

const snow = [
    0xFFFFFF, // Pure White Snow
    0xF9F9F9, // Soft Bright White
    0xF4F4F4, // Light Grayish White
    0xEFEFEF, // Subtle Off-White
    0xF6F6F6, // Clean Snowy White
    0xFAFAFA, // Gentle Soft White
    0xECECEC, // Slightly Dimmer White
    0xF7F7F7, // Neutral Snow Tone
];

const sandGrassTransition = [
    0xA2A86A, // Soft Olive with Green Tint
    0x98A259, // Muted Yellow-Green
    0xA8AA6D, // Balanced Olive-Tan
    0xACB16F, // Warm Olive-Tan with a Hint of Green
    0x9CA564, // Earthy Greenish Yellow
    0xADB36E, // Faded Greenish Tan
    0xA4A96A, // Neutral Olive-Green Mix
    0xB0B46F, // Pale Green-Tinted Tan
];

const grassStoneTransition = [
    0x6B7B4F, // Earthy Green with Grayish Tint
    0x707F5A, // Muted Green with Stone Influence
    0x74804E, // Balanced Green and Gray
    0x6F7B56, // Subtle Greenish Stone Tone
    0x7A7F64, // Slightly Gray-Green Blend
    0x6C7A57, // Earthy Green with Stone Hints
    0x7A7C62, // Grass-Grayish Mix
    0x747D5B, // Soft Greenish Stone
];


const canopyColors = {
    spring: [
        0x8BC34A
    ],
    summer: [
        0x4CAF50, // Fresh grass green
        0x6DBE45, // Lush green
        0x8BC34A, // Light leafy green
        0x7A9E3C, // Verdant green
        0xA8D08D, // Soft spring green
        0x6F9E4F, // Forest leaf green
        0x4E8B2D, // Bright leafy green
        0x6B8E23, // Olive green
        0x9CDB6A, // Fresh lime green
        0x80E27E  // Pale mint green
    ],
    autumn: [
        0x9E5B3E, // Warm brown
        0x8B4F33, // Deep brown
        0x9C6C3E, // Golden brown
        0x7A4B27, // Rusty brown
        0x9B6B30, // Mustard yellow
        0xAB702A, // Rich orange
        0x9F5221, // Burnt orange
        0xAE6B2F, // Dark amber
        0x9D6438, // Rustic red-brown
        0x7C502A  // Dark earthy brown
    ],
    winter: [
        0x5D6E3F
    ]
};





export { grass, sand, sandGrassTransition, stone, grassStoneTransition, snow, canopyColors }