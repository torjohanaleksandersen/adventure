import * as THREE from 'three'
import { Sky } from '../imports/Sky.js';
import { MathUtils } from '../imports/MathUtils.js';
import { time } from '../main.js';
import { CHUNK_SIZE, DRAW_RANGE } from './world.js';


export class Graphics {
    constructor (scene) {
        this.scene = scene

        //scene light
        this.ambient = new THREE.AmbientLight(0xffffff, 0.1);
        this.sun = new THREE.DirectionalLight(0xffffff, 1);
        this.sun.castShadow = true;

        const d = 50;
        this.sun.shadow.camera.left = -d;
        this.sun.shadow.camera.right = d;
        this.sun.shadow.camera.top = d;
        this.sun.shadow.camera.bottom = -d;
        this.sun.shadow.camera.near = 100;
        this.sun.shadow.camera.far = 400;
        this.sun.shadow.bias = -0.01
        this.sun.shadow.mapSize = new THREE.Vector2(2048);

        this.scene.add(this.ambient);
        this.scene.add(this.sun);
        this.scene.add(this.sun.target);


        this.moon = new THREE.DirectionalLight(0xffffff, 0.1);
        this.scene.add(this.moon);

        //fog
        this.scene.fog = new THREE.Fog(0xffffff, DRAW_RANGE * CHUNK_SIZE * 0.3, DRAW_RANGE * CHUNK_SIZE * 0.6); //100, 180
        //sky
        this.sky = new Sky();
        this.sky.scale.setScalar( 450000 );
        this.sky.material.uniforms.turbidity.value = 0.5;
        this.sky.material.uniforms.mieDirectionalG = 0;

        this.scene.add(this.sky);
    }

    update(dt, player) {
        const phi = MathUtils.degToRad(time.getTime());
        const theta = MathUtils.degToRad(180);
        const sunPosition = new THREE.Vector3().setFromSphericalCoords(1, phi, theta);
        const moonPosition = new THREE.Vector3().setFromSphericalCoords(1, phi + Math.PI, theta);
    
        this.sun.position.copy(player.position);
        this.sun.position.add(sunPosition.clone().multiplyScalar(450000));
        this.sun.target.position.copy(player.position);
    
        this.moon.position.copy(player.position);
        this.moon.position.add(moonPosition.clone().multiplyScalar(450000));
        this.moon.target.position.copy(player.position);
    
        this.sky.material.uniforms.sunPosition.value = sunPosition;
    
        const diurnal = time.DiurnalCycleValue;
    
        // Smoothly transition fog density
        this.scene.fog.density = 0.002 + 0.003 * (1 - Math.abs(diurnal));
        
    
        // Define fog color targets
        const dayFogColor = new THREE.Color(0xffffff); // White for day
        const sunRiseSetColor = new THREE.Color(0xcbb395); // Sunrise/Sunset color
        const nightFogColor = new THREE.Color(0x3d363f); // Brown or black for night
    
        // Determine target fog color
        let targetFogColor;
        let transitionTimeConstant = 0
        if (time.isNight()) {
            targetFogColor = nightFogColor;
            transitionTimeConstant = 1
        } else if (diurnal < 0.09 && diurnal > - 0.75 ) {
            // Transition at sunrise/sunset
            targetFogColor = sunRiseSetColor;
            transitionTimeConstant = 1
        } else {
            targetFogColor = dayFogColor;
            transitionTimeConstant = 1
        }
    
        // Adjust the transition speed (make it longer)
        // Use a smoother transition factor (lower value for slower transition)
        const transitionSpeed = transitionTimeConstant * time.tickSpeed;  // This value controls the speed of the transition (lower is slower)
        const lerpFactor = Math.min(dt * transitionSpeed, 1); // Adjust smoothing speed
    
        // Smoothly interpolate current fog color towards the target color
        this.scene.fog.color.lerpColors(this.scene.fog.color, targetFogColor, lerpFactor);
    
        // Adjust sun and moon intensity based on time of day
        if (time.isNight()) {
            this.sun.intensity = 0.05 - 0.05 * Math.abs(diurnal);
            this.moon.intensity = 0.05 + 0.05 * Math.abs(diurnal);
            this.ambient.intensity = 0.03;

        } else {
            this.sun.intensity = 0.05 + 1.95 * Math.abs(diurnal);
            this.moon.intensity = 0.05 - 0.05 * Math.abs(diurnal);
            this.ambient.intensity = 0.03 + Math.abs(diurnal) * 0.08;
        }
    }
}