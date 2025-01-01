import * as THREE from 'three';
import { models } from '../main.js';

export class Builder {
    constructor (scene) {

    }


    renderPossibleBuilding(modelName, position) {
        const model = models.getModel(modelName);
        model.material.transparent = true;
        model.material.opacity = 0.5;
        model.material.color = 0x00ff00;
        model.position.set(position);
    }
}
