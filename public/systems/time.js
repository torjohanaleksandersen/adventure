
export class Time {
    constructor() {
        this.time = 0; // Time in degrees (0 = midday, 180 = midnight)
        this.tickSpeed = 1; // Speed multiplier for time progression
        this.deltaTime = 0; // Time since the last update
    }

    // Get time of day in hours
    get TimeOfDay() {
        const time = (this.time % 360) / 360 * 24; // Map 360° to 24 hours
        return (time + 12) % 24; // Adjust so 0° = 12 (noon), 180° = 0 (midnight)
    }

    // Get diurnal cycle value (-1 to 1)
    get DiurnalCycleValue() {
        const radians = (this.time % 360) * (Math.PI / 180); // Convert degrees to radians
        return Math.cos(radians); // Cosine wave: 1 (midday), 0 (sunrise/sunset), -1 (midnight)
    }

    // Check if it is night
    isNight() {
        const time = this.time % 360;
        return time > 90 && time < 270; // Night is between 90° and 270°
    }

    // Get delta time (time elapsed since last update)
    getDelta() {
        return this.deltaTime;
    }

    // Get current time in degrees
    getTime() {
        return this.time;
    }

    // Update time progression
    update(dt) {
        this.time += dt * this.tickSpeed; // Progress time
        this.deltaTime = dt; // Record delta time
    }
}
