import { useState, useRef, useEffect } from "react";

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

function RoofViewer() {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);

  // Function to calculate the surface area
  function calculateSurfaceArea(geometry) {
    if (!geometry.isBufferGeometry) {
      console.error("Surface area calculation requires a BufferGeometry.");
      return 0;
    }

    const position = geometry.attributes.position;
    const index = geometry.index;

    let totalArea = 0;

    if (index) {
      // Indexed geometry
      const indices = index.array;
      for (let i = 0; i < indices.length; i += 3) {
        const a = new THREE.Vector3().fromBufferAttribute(position, indices[i]);
        const b = new THREE.Vector3().fromBufferAttribute(
          position,
          indices[i + 1]
        );
        const c = new THREE.Vector3().fromBufferAttribute(
          position,
          indices[i + 2]
        );

        totalArea += calculateTriangleArea(a, b, c);
      }
    } else {
      // Non-indexed geometry
      for (let i = 0; i < position.count; i += 3) {
        const a = new THREE.Vector3().fromBufferAttribute(position, i);
        const b = new THREE.Vector3().fromBufferAttribute(position, i + 1);
        const c = new THREE.Vector3().fromBufferAttribute(position, i + 2);

        totalArea += calculateTriangleArea(a, b, c);
      }
    }

    return totalArea;
  }

  // Helper function to calculate the area of a triangle
  function calculateTriangleArea(a, b, c) {
    const ab = new THREE.Vector3().subVectors(b, a);
    const ac = new THREE.Vector3().subVectors(c, a);
    const crossProduct = new THREE.Vector3().crossVectors(ab, ac);

    return 0.5 * crossProduct.length();
  }

  function addGrid() {
    const size = 1000;
    const divisions = 20;
    const gridHelper = new THREE.GridHelper(size, divisions);
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.material.opacity = 0.25;
    gridHelper.material.transparent = true;
    sceneRef.current.add(gridHelper);
  }

  useEffect(() => {
    sceneRef.current = new THREE.Scene();
    cameraRef.current = new THREE.PerspectiveCamera(
      35,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    cameraRef.current.position.set(3.21783, 5.25797, 30.0883);

    rendererRef.current = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
    });
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);

    controlsRef.current = new OrbitControls(
      cameraRef.current,
      canvasRef.current
    );

    var geom = new THREE.PlaneGeometry(1, 1);
    console.log(geom.faces);

    new RGBELoader().load(
      "/hdri/symmetrical_garden_02_1k.hdr",
      function (texture, textureData) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        //sceneRef.current.background = texture;
        sceneRef.current.environment = texture;
      }
    );

    // Instantiate a loader
    const loader = new GLTFLoader();

    // Load a glTF resource
    loader.load(
      // resource URL
      "/models/house_model_2.glb",
      // called when the resource is loaded
      function (gltf) {
        sceneRef.current.add(gltf.scene);

        console.log(gltf.scene);

        const roof_object = gltf.scene.getObjectByName("roof_tile_1_0"); //roof_tile_1_0

        console.log(calculateSurfaceArea(roof_object.geometry));

        gltf.animations; // Array<THREE.AnimationClip>
        gltf.scene; // THREE.Group
        gltf.scenes; // Array<THREE.Group>
        gltf.cameras; // Array<THREE.Camera>
        gltf.asset; // Object
      },
      // called while loading is progressing
      function (xhr) {},
      // called when loading has errors
      function (error) {
        console.log("An error happened");
      }
    );

    addGrid();

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controlsRef.current.update();
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    animate();
  }, []);

  return (
    <div className="container">
      <canvas className="canvas" ref={canvasRef}></canvas>
    </div>
  );
}

export default RoofViewer;
