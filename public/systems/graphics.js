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

        //fog
        this.scene.fog = new THREE.Fog(0xD7D0FF, 400, 500);

        //sky
        this.sky = new Sky();
        this.sky.scale.setScalar( 450000 );
        this.sky.material.uniforms.turbidity.value = 0.5;
        this.sky.material.uniforms.mieDirectionalG = 0;

        this.scene.add(this.sky);
    }

    get TimeOfDay() {
        const time = (this.time % 360) / 360 * 24; //in hours
        return time;
    }

    update(dt, player) {
        const phi = MathUtils.degToRad( time.getTime());
        const theta = MathUtils.degToRad( 180 );
        const sunPosition = new THREE.Vector3().setFromSphericalCoords( 1, phi, theta );

        this.sun.position.copy(player.position);
        this.sun.position.add(sunPosition.clone().multiplyScalar(450000));
        this.sun.target.position.copy(player.position);

        this.sky.material.uniforms.sunPosition.value = sunPosition;

        if (time.isNight()) {
            this.sun.intensity = 0;
        } else {
            this.sun.intensity = 1;
        }
    }
}