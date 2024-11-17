import * as THREE from 'three'
import { Sky } from '../imports/three/examples/jsm/Addons.js';
import { MathUtils } from '../imports/MathUtils.js';
import { time } from '../main.js';


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
        this.scene.fog = new THREE.Fog(0xffffff, 100, 180);

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
    
        const diurnal = Math.abs(time.DiurnalCycleValue);
    
        // Smoothly transition fog density
        this.scene.fog.density = 0.005 * (1 - diurnal);
    
        // Define fog color targets
        const dayFogColor = new THREE.Color(0xffffff); // White for day
        const redFogColor = new THREE.Color(0xff4500); // Red for sunrise/sunset
        const nightFogColor = new THREE.Color(0x000000); // Black for night
    
        // Determine target fog color
        let targetFogColor;
        if (time.isNight()) {
            targetFogColor = nightFogColor;
        } else if (diurnal < 0.2) {
            // Blend towards red at sunrise/sunset
            const redFactor = 1 - diurnal * 2; // Ranges from 1 to 0 as diurnal approaches 0.5
            targetFogColor = redFogColor.clone().lerp(dayFogColor, redFactor);
        } else {
            targetFogColor = dayFogColor;
        }
    
        // Smoothly interpolate current fog color towards the target color
        const lerpFactor = Math.min(dt * 5, 1); // Adjust smoothing speed
        this.scene.fog.color.lerpColors(this.scene.fog.color, targetFogColor, lerpFactor);
    
        if (time.isNight()) {
            this.sun.intensity = 0;
            this.moon.intensity = 0.1 * diurnal;
        } else {
            this.sun.intensity = 2 * diurnal;
            this.moon.intensity = 0;
        }
    }
    
    
}