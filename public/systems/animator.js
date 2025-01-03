import * as THREE from 'three'
import { FBXLoader } from '../imports/FBXLoader/FBXLoader.js'

const animations = [
    'idle',
    'walking'
]

export class Animator {
    constructor(mixer) {
        this.mixer = mixer
        this.animations = {}
        this.currentAnimationPlaying = ''
        this.timeMultiplayer = 1

        this.loader = new FBXLoader()
        this.loader.setPath('./animations/')

        animations.forEach(key => {
            this.loader.load(key + '.fbx', animation => {
                this.animations[key] = this.mixer.clipAction(animation.animations[0])

                if (key === 'reloading' || key === 'death') {
                    this.animations[key].setLoop(THREE.LoopOnce)
                    this.animations[key].clampWhenFinished = true

                    /*
                    // Add the event listener for 'finished' only once
                    this.mixer.addEventListener('finished', (e) => {
                        this.play('fps_standard') // Play standard animation after reload
                    })
                    */
                }
            })
        })
    }

    switchReloadAnimation(key) {
        const time = this.getTimeOfCurrentAnimation()

        animations.forEach(_key => {
            this.animations[_key].fadeOut(0)
        })
        this.animations[key].reset().fadeIn(0).play()
        this.animations[key].time = time
        this.currentAnimationPlaying = key
    }

    getTimeOfCurrentAnimation() {
        return this.animations[this.currentAnimationPlaying].time
    }

    pauseAnimation() {
        this.animations[this.currentAnimationPlaying].paused = true
    }

    play(key) {
        if (this.currentAnimationPlaying.includes('reloading') && 
            key.includes('reloading') && 
            (this.currentAnimationPlaying !== key)
        ) {
            this.switchReloadAnimation(key)
            return
        }
        if (!this.animations[key] || key === this.currentAnimationPlaying) return
        
        animations.forEach(_key => {
            this.animations[_key].fadeOut(0.2)
        })

        this.animations[key].reset().fadeIn(0.2).play()
        this.currentAnimationPlaying = key
    }

    update(dt) {
        dt *= this.timeMultiplayer
        this.mixer.update(dt)
    }
}
