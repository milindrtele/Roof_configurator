import { useState, useRef, useEffect } from "react";

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import MySky from "../scripts/sky";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

import MyHouse from "../scripts/myHouse";

function RoofViewer() {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const transformControlRef = useRef(null);

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

  function addSky() {
    const effectController = {
      turbidity: 10,
      rayleigh: 3,
      mieCoefficient: 0.005,
      mieDirectionalG: 0.7,
      elevation: 2,
      azimuth: 180,
      exposure: rendererRef.current.toneMappingExposure,
    };

    const shadowProperties = {
      color: 0xffffff,
      castShadow: true,
      near: 1,
      far: 250,
      bias: -0.0001,
    };

    let sun = new THREE.Vector3();
    const mySky = new MySky(sceneRef.current);
    console.log(mySky);
    const uniforms = mySky.sky.material.uniforms;
    uniforms["turbidity"].value = effectController.turbidity;
    uniforms["rayleigh"].value = effectController.rayleigh;
    uniforms["mieCoefficient"].value = effectController.mieCoefficient;
    uniforms["mieDirectionalG"].value = effectController.mieDirectionalG;

    const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
    const theta = THREE.MathUtils.degToRad(effectController.azimuth);

    sun.setFromSphericalCoords(1, phi, theta);

    uniforms["sunPosition"].value.copy(sun);

    const spotLight = new THREE.SpotLight(0xffffff, 10000);
    spotLight.position.set(20, 20, 2.5);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 1;
    spotLight.decay = 2;
    spotLight.distance = 0;
    //spotLight.map = textures["disturb.jpg"];

    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 100;
    spotLight.shadow.focus = 1;
    spotLight.shadow.bias = -0.0001;
    sceneRef.current.add(spotLight);

    transformControlRef.current.attach(spotLight);

    const lightHelper = new THREE.SpotLightHelper(spotLight);
    sceneRef.current.add(lightHelper);

    function guiChanged() {
      const uniforms = mySky.sky.material.uniforms;
      uniforms["turbidity"].value = effectController.turbidity;
      uniforms["rayleigh"].value = effectController.rayleigh;
      uniforms["mieCoefficient"].value = effectController.mieCoefficient;
      uniforms["mieDirectionalG"].value = effectController.mieDirectionalG;

      const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
      const theta = THREE.MathUtils.degToRad(effectController.azimuth);

      sun.setFromSphericalCoords(1, phi, theta);
      let lightPos = new THREE.Vector3().setFromSphericalCoords(30, phi, theta);
      spotLight.position.set(lightPos.x, lightPos.y, lightPos.z);

      uniforms["sunPosition"].value.copy(sun);

      rendererRef.current.toneMappingExposure = effectController.exposure;
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }

    function shadowChanged() {
      //light.color = shadowProperties.color;
      spotLight.shadow.camera.top = shadowProperties.top;
      spotLight.shadow.camera.bottom = shadowProperties.bottom;
      spotLight.shadow.camera.left = shadowProperties.left;
      spotLight.shadow.camera.right = shadowProperties.right;
      spotLight.shadow.camera.near = shadowProperties.near;
      spotLight.shadow.camera.far = shadowProperties.far;
      spotLight.shadow.bias = shadowProperties.bias;
      spotLight.castShadow = shadowProperties.castShadow;
      spotLight.shadow.camera.updateProjectionMatrix();
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }

    const gui = new GUI();

    gui.add(effectController, "turbidity", 0.0, 20.0, 0.1).onChange(guiChanged);
    gui.add(effectController, "rayleigh", 0.0, 4, 0.001).onChange(guiChanged);
    gui
      .add(effectController, "mieCoefficient", 0.0, 0.1, 0.001)
      .onChange(guiChanged);
    gui
      .add(effectController, "mieDirectionalG", 0.0, 1, 0.001)
      .onChange(guiChanged);
    gui.add(effectController, "elevation", 0, 90, 0.1).onChange(guiChanged);
    gui.add(effectController, "azimuth", -180, 180, 0.1).onChange(guiChanged);
    gui.add(effectController, "exposure", 0, 1, 0.0001).onChange(guiChanged);

    // Add the properties to the GUI

    gui.add(shadowProperties, "castShadow").onChange(shadowChanged);
    gui.addColor(shadowProperties, "color").onChange((value) => {
      spotLight.color.set(value);
    });
    gui.add(shadowProperties, "near", 0, 5000, 10).onChange(shadowChanged);
    gui.add(shadowProperties, "far", 0, 5000, 10).onChange(shadowChanged);
    gui
      .add(shadowProperties, "bias", -0.01, 0.01, 0.0001)
      .onChange(shadowChanged);

    guiChanged();
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
      antialias: true,
    });
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current.shadowMap.enabled = true;
    rendererRef.current.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

    controlsRef.current = new OrbitControls(
      cameraRef.current,
      canvasRef.current
    );

    transformControlRef.current = new TransformControls(
      cameraRef.current,
      canvasRef.current
    );

    transformControlRef.current.addEventListener(
      "dragging-changed",
      function (event) {
        controlsRef.current.enabled = !event.value;
      }
    );

    const gizmo = transformControlRef.current.getHelper();
    sceneRef.current.add(gizmo);

    new RGBELoader().load(
      // "/hdri/symmetrical_garden_02_1k.hdr",
      //"/hdri/rosendal_plains_1_1k.hdr",
      //"/hdri/rogland_clear_night_1k.hdr",
      "/hdri/qwantani_dusk_2_1k.hdr",
      //"/hdri/goegap_road_1k.hdr",
      function (texture, textureData) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        //sceneRef.current.background = texture;
        sceneRef.current.environment = texture;
      }
    );

    const ambiLight = new THREE.AmbientLight(0xffffff, 1); // soft white light
    sceneRef.current.add(ambiLight);

    // Instantiate a loader
    const loader = new GLTFLoader();

    const myHouse = new MyHouse(sceneRef.current, "/models/Model_01.glb");

    // // Load a glTF resource
    // loader.load(
    //   // resource URL
    //   "/models/Model_01.glb",
    //   // called when the resource is loaded
    //   function (gltf) {
    //     //sceneRef.current.add(gltf.scene);

    //     console.log(gltf.scene);

    //     // const roof_object = gltf.scene.getObjectByName("roof_tile_1_0"); //roof_tile_1_0

    //     // console.log(calculateSurfaceArea(roof_object.geometry));

    //     gltf.scene.traverse((obj) => {
    //       if (obj.isMesh) {
    //         obj.castShadow = true;
    //         obj.receiveShadow = true;
    //         console.log(obj);
    //       }
    //     });
    //   },
    //   // called while loading is progressing
    //   function (xhr) {},
    //   // called when loading has errors
    //   function (error) {
    //     console.log("An error happened");
    //   }
    // );

    //addGrid();

    addSky();

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
