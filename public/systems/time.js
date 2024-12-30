
export class Time {
    constructor() {
        this.time = 0;
        this.tickSpeed = 1;
        this.deltaTime = 0;
        this.startDay = 0;
        this.season = '',
        this.seasonLengthInDays = 4;

        this.listeners = {
            'day-change': []
        }

        this.previousDay = this.getDay();
        this.getSeasonData();
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
        return this.deltaTime * this.tickSpeed;
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
        let p = (this.getDay() % this.seasonLengthInDays) / this.seasonLengthInDays;
        let progress = 0
        if (p < 0.5) {
            progress = 0;
        } else if (p <= 0.75) {
            progress = 2 * (p - 0.5);
        } else {
            progress = p;
        }
        this.season = season;
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
