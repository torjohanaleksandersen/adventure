import * as THREE from 'three'
import { time } from "../main.js";
import { CHUNK_SIZE, DRAW_RANGE } from "./world.js";
/*
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
*/

const weather = {
    primary: ['clear', 'rain'],
    secondary: ['wind', 'fog', 'cloud']
}
const seasons = {
    spring: {
        weatherChances: [0.80, 0.20]
    },
    summer: {
        weatherChances: [0.90, 0.10]
    },
    autumn: {
        weatherChances: [0.70, 0.30]
    },
    winter: {
        weatherChances: [0.50, 0.50]
    },
}

let amplitude = 7;

let lastDay = -1;

let lastWeather = '';
let particleDistance = 1;

export class Weather {
    constructor () {
        this.temperature = 0;
        this.currentWeather = {
            weather: '',
            time: 0,
        };
        this.windDirection = new THREE.Vector3(0, 0, 0);

        this.snowingChunks = {};

        this.set(null)
    }

    set() {
        let type = '';

        this.weather = type;
    }

    getTemperature() {
        const base = Math.sin(time.getDay() * Math.PI / (time.seasonLengthInDays * 2) + Math.PI / 5) * 30 - 5
        const daily = amplitude * Math.sin(Math.PI * time.getHour() / 12 - (3 * Math.PI / 4));
        return base + daily;
    }

    updateTemperatureData() {
        let m = 1;
        if (Math.random() > 0.5) m = -1;
        let rn = Math.random() * 0.5 * m;
        if (amplitude + rn > 10 || amplitude + rn < 5) {
            rn *= -1;
        }
        amplitude += rn;
    }

    dayUpdate() {

    }

    update(position, particleEffects) {
        let day = time.getDay()
        if (day != lastDay) {
            this.updateTemperatureData();
            lastDay = day;
        }
    }
} 