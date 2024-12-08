import * as THREE from 'three'
import { time } from "../main.js";
import { CHUNK_SIZE, DRAW_RANGE } from "./world.js";

const temperatures = {
    scorching: {
        temperature: [37, 100],
    },
    hot: {
        temperature: [20, 36],
    },
    mild: {
        temperature: [12, 19],
    },
    cool: {
        temperature: [5, 11],
    },
    cold: {
        temperature: [-8, 4],
    },
    freezing: {
        temperature: [-25, -9],
    },
    frigid: {
        temperature: [-120, -27],
    }
}

const weathers = {
    clear: {
        fog: {
            density: 0.003,
            nearFar: [DRAW_RANGE * CHUNK_SIZE * 0.5, DRAW_RANGE * CHUNK_SIZE * 0.85]
        }
    },
    rain: {
        fog: {
            density: 0.008,
            nearFar: [DRAW_RANGE * CHUNK_SIZE * 0.35, DRAW_RANGE * CHUNK_SIZE * 0.65]
        }
    },
    snow: {
        fog: {
            density: 0.010,
            nearFar: [DRAW_RANGE * CHUNK_SIZE * 0.30, DRAW_RANGE * CHUNK_SIZE * 0.60]
        }
    },
    mist: {
        fog: {
            density: 0.012,
            nearFar: [DRAW_RANGE * CHUNK_SIZE * 0.25, DRAW_RANGE * CHUNK_SIZE * 0.5]
        }
    }
}

/*
const seasons = {
    spring: {
        temperature: {
            day: [10, 20],
            night: [-10, 0]
        }
    },
    summer: {
        temperature: {
            day: [20, 36],
            night: [10, 25]
        }
    },
    autumn: {
        temperature: {
            day: [10, 25],
            night: [-5, 5]
        }
    },
    winter: {
        temperature: {
            day: [-25, 5],
            night: [-40, -10]
        }
    },
}
*/

const seasons = {
    spring: [-15, 20],
    summer: [10, 36],
    autumn: [-5, 25],
    winter: [-40, 5],
}

let amplitude = 10;
let avgTemp = 10;

let lastDay = -1;

let lastWeather = '';
let particleDistance = 1;

export class Weather {
    constructor () {
        this.temperature = 0;
        this.weather = '';
        this.windDirection = new THREE.Vector3(0, 0, 0);

        this.snowingChunks = {};
    }

    set(type) {
        this.weather = type;
    }

    getTemperature() {
        return amplitude * Math.sin(Math.PI * time.getHour() / 12 - (3 * Math.PI / 4)) + avgTemp;
    }

    updateTemperatureData() {
        const { season, progress } = time.getSeasonData();
    
        // Determine the next season
        const seasonOrder = ['spring', 'summer', 'autumn', 'winter'];
        const currentIndex = seasonOrder.indexOf(season);
        const nextSeason = seasonOrder[(currentIndex + 1) % seasonOrder.length];
    
        // Get temperature ranges for the current and next seasons
        const [currentMin, currentMax] = seasons[season];
        const [nextMin, nextMax] = seasons[nextSeason];
    
        // Interpolate between current and next season based on progress
        const interpolatedMin = (1 - progress) * currentMin + progress * nextMin;
        const interpolatedMax = (1 - progress) * currentMax + progress * nextMax;
    
        // Calculate the current average temperature
        const currentAvgTemp = (interpolatedMin + interpolatedMax) / 2;
    
        // Adjust the daily variation amplitude
        const dailyVariation = (interpolatedMax - interpolatedMin) * (Math.random() * 0.5 + 0.2);
    
        amplitude = dailyVariation / 2;
        avgTemp = currentAvgTemp;
    }
    
    

    dayUpdate() {

    }

    update(position, particleEffects) {
        let day = time.getDay()
        if (day != lastDay) {
            this.updateTemperatureData();
            lastDay = day;
        }
        if (this.weather != lastWeather) {
            lastWeather = this.weather;
            if (this.weather == 'snow') {
                const chunkX = Math.ceil((position.x - CHUNK_SIZE / 2) / CHUNK_SIZE);
                const chunkZ = Math.ceil((position.z - CHUNK_SIZE / 2) / CHUNK_SIZE);
    
    
                for (let x = chunkX - particleDistance; x < chunkX + particleDistance + 1; x ++) {
                    for (let z = chunkZ - particleDistance; z < chunkZ + particleDistance + 1; z ++) {
                        const position = new THREE.Vector2(x * CHUNK_SIZE, z * CHUNK_SIZE);
                        particleEffects.createSnow({position: position});
                    }
                }
            } else if (this.weather == 'clear') {
                particleEffects.removeSnow(null);
            }
        }
    }
} 