
export class Time {
    constructor() {
        this.time = 0;
        this.tickSpeed = 0.5;
        this.deltaTime = 0;
        this.seasonLengthInDays = 10;
    }

    get DayCount() {
        return Math.floor((this.time + 90) / 360);
    }

    get TimeOfDay() {
        const time = (this.time % 360) / 360 * 24;
        return (time + 12) % 24;
    }

    get DiurnalCycleValue() {
        const radians = (this.time % 360) * (Math.PI / 180);
        return Math.cos(radians);
    }

    isNight() {
        const time = this.time % 360;
        return time > 90 && time < 270;
    }

    getDelta() {
        return this.deltaTime;
    }

    getTime() {
        return this.time;
    }

    get Season() {
        const seasons = ['summer', 'autumn', 'winter', 'spring'];
        return seasons[Math.floor(this.DayCount / this.seasonLengthInDays) % seasons.length];
    }

    update(dt) {
        this.time += dt * this.tickSpeed;
        this.deltaTime = dt;
    }
}
