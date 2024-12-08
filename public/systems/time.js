
export class Time {
    constructor() {
        this.time = 180;
        this.tickSpeed = 1;
        this.deltaTime = 0;
        this.startDay = 0;
        this.seasonLengthInDays = 10;

        this.listeners = {
            'day-change': []
        }

        this.previousDay = this.getDay();
    }

    addEventListener(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }

    dispatchEvent(event) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback());
        }
    }

    getDay() {
        return this.startDay + Math.floor((this.time + 180) / 360);
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

    getHour() {
        const time = (this.time % 360) / 360 * 24;
        return (time + 12) % 24;
    }

    getSeasonData() {
        const seasons = ['summer', 'autumn', 'winter', 'spring'];
        const season = seasons[Math.floor(this.getDay() / this.seasonLengthInDays) % seasons.length];
        const progress = (this.getDay() % this.seasonLengthInDays) / this.seasonLengthInDays;
        return {season, progress};
    }

    update(dt) {
        this.time += dt * this.tickSpeed;
        this.deltaTime = dt;


        const currentDay = this.getDay();
        if (currentDay != this.previousDay) {
            this.previousDay = currentDay;
            this.dispatchEvent('day-change');
        }
    }
}
