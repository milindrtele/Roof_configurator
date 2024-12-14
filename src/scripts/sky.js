import * as THREE from "three";
import { Sky } from "three/addons/objects/Sky.js";

class MySky {
  constructor(scene) {
    this.scene = scene;
    this.init();
  }
  init() {
    this.sky = new Sky();
    this.sky.scale.setScalar(450000);

    const phi = THREE.MathUtils.degToRad(90);
    const theta = THREE.MathUtils.degToRad(180);
    const sunPosition = new THREE.Vector3().setFromSphericalCoords(
      1,
      phi,
      theta
    );

    this.sky.material.uniforms.sunPosition.value = sunPosition;

    this.scene.add(this.sky);
  }
}

export default MySky;
