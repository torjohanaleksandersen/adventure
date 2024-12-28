import * as THREE from 'three'
import { particleEffects, time } from "../main.js";
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

const weathers = {
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
        weatherChances: [1.0, 0.0]
    },
}

let amplitude = 7;

let lastDay = -1;

export class Weather {
    constructor () {
        this.temperature = 0;
        this.current = {
            type: '',
            duration: 0,
        };
        this.windDirection = new THREE.Vector3(1, 0, 1);

        this.snowingChunks = {};

        this.snowLevel = -0.2;
        this.iceOnWater = false;
        this.snowOnNatureAssets = false;
        this.timeAboveFreezing = 0;
        this.timeBelowFreezing = 0;

        this.timeBelowIceTemperature = 0;
        this.timeAboveIceTemperature = 0;
        this.iceTemperature = -5;

        this.set()
    }

    set(options = {}) {
        let index = 0;

        const r = Math.random();
        for (let i = 0; i < 2; i++) {
            if (r < seasons[time.season].weatherChances[i]) {
                index = i;
                break;
            }
        }
    
        let defaultType = weathers.primary[index]; // Determine default weather type
        const defaultDuration = 120 + Math.random() * 60; // Default duration

        if (this.temperature <= 0 && defaultType == 'rain') {
            defaultType = 'snow';
        }


    
        const {
            type = defaultType,
            duration = defaultDuration,
        } = options;

        if (type != this.current.type) {
            this.change(type, this.current.type);
        }
    
        this.current = {
            type,
            duration,
            time: duration,
        };
    
        console.log(`Weather set to ${type} for ${duration} s`);
    }

    change(weather, lastWeather) {
        if (weather == 'rain' || weather == 'snow') {
            particleEffects.createWeather(weather);
        } else if (weather == 'clear') {
            particleEffects.removeWeather(lastWeather);
        }
    }


    

    getTemperature() {
        return this.temperature;
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

    update() {
        let day = time.getDay()
        if (day != lastDay) {
            this.updateTemperatureData();
            lastDay = day;
        }

        const dt = time.getDelta()

        const base = Math.sin(time.getDay() * Math.PI / (time.seasonLengthInDays * 2) + Math.PI / 5) * 30 - 5
        const daily = amplitude * Math.sin(Math.PI * time.getHour() / 12 - (3 * Math.PI / 4));
        this.temperature = base + daily;


        //setting new weather
        this.current.time -= dt;
        if (this.current.time < 0) {
            this.set();
        }

        //handling ice on water
        if (this.temperature < this.iceTemperature) {
            this.timeBelowIceTemperature += dt;
        } else {
            this.timeAboveIceTemperature += dt;
        }

        if (this.timeBelowIceTemperature > 100) {
            this.timeAboveIceTemperature = 0;
            this.iceOnWater = true;
        }

        if (this.timeAboveIceTemperature > 100) {
            this.timeBelowIceTemperature = 0;
            this.iceOnWater = false;
        }


        //Handling snow on nature assets
        if (this.temperature > 0) {
            this.timeAboveFreezing += dt;
        } else {
            this.timeBelowFreezing += dt;
        }

        if (this.timeBelowFreezing > 5 && this.snowLevel > 0.3) {
            this.timeAboveFreezing = 0;
            this.snowOnNatureAssets = true;
        }

        if (this.timeAboveFreezing > 5 && this.snowLevel < 0.3) {
            this.timeBelowFreezing = 0;
            this.snowOnNatureAssets = false;
        }


        //snowlevel increase
        if (this.current.type == 'snow') {
            this.snowLevel += 0.002 * dt
        } else if (this.temperature > 0) {
            this.snowLevel -= 0.002 * dt;
        }

        if (this.snowLevel > 0.2) {
            this.snowLevel = 0.2;
        } else if (this.snowLevel < -0.2) {
            this.snowLevel = -0.2;
        }
    }
} 