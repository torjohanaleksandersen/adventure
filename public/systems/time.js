
export class Time {
    constructor () {
        this.time = 0;
        this.tickSpeed = 10;
        this.deltaTime = 0;
    }

    isNight() {
        if ((this.time % 360) > 90 && (this.time % 360) < 270) return true
        return false
    }

    getDelta() {
        return this.deltaTime;
    }

    getTime() {
        return this.time;
    }

    update(dt) {
        this.time += dt * this.tickSpeed;
        this.deltaTime = dt;
    }
}