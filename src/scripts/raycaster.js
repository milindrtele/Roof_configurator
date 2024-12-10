import * as THREE from "three";

class MyRaycaster {
  constructor(canvas, scene, camera, controls, callback) {
    this.canvas = canvas;
    this.scene = scene;
    this.camera = camera;
    this.controls = controls;

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    // Bind the `onClick` method to the instance
    this.handleClick = this.onClick.bind(this);

    // Add event listener to the canvas
    this.canvas.addEventListener("dblclick", this.handleClick);

    // Bind the `onHover` method to the instance
    this.handlePointerMove = this.onHover.bind(this);
    // Add event listener to the canvas
    this.canvas.addEventListener("mousemove", this.handlePointerMove);

    this.callback = callback;
  }

  onClick() {
    console.log(this.intersects);
    if (
      this.intersects &&
      this.intersects.length > 0 &&
      this.intersects[0].object.name == "grid_helper"
    ) {
      this.callback(this.intersects[0].point);
    }
  }

  onHover(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);

    this.intersects = this.raycaster.intersectObjects(this.scene.children);
  }

  dispose() {
    // Remove the event listener to prevent memory leaks
    this.canvas.removeEventListener("click", this.handleClick);
    this.canvas.removeEventListener("mousemove", this.handlePointerMove);
  }
}

export default MyRaycaster;
