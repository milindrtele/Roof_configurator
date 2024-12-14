import { useState, useRef, useEffect, useContext } from "react";

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import MyRaycaster from "../scripts/raycaster";

import { FunctionContext } from "./FunctionContext";

function RoofEditor(props) {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const raycasterRef = useRef(null);

  const shapeRef = useRef(null);

  const { roofDesignerAction, setRoofDesignerAction } =
    useContext(FunctionContext);

  function addGrid() {
    const size = 100;
    const divisions = 100;
    const gridHelper = new THREE.GridHelper(size, divisions);
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.material.opacity = 0.25;
    gridHelper.material.transparent = true;
    gridHelper.name = "grid_helper";
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

    sceneRef.current.background = new THREE.Color(0xffffff);

    // Instantiate a loader
    const loader = new GLTFLoader();

    // Load a glTF resource
    loader.load(
      // resource URL
      "/models/roofs/Gable_Roof.glb",
      // called when the resource is loaded
      function (gltf) {
        sceneRef.current.add(gltf.scene);
        console.log(gltf.scene);
      },
      // called while loading is progressing
      function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      // called when loading has errors
      function (error) {
        console.log("An error happened");
      }
    );

    new RGBELoader().load(
      "/hdri/symmetrical_garden_02_1k.hdr",
      function (texture, textureData) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        //sceneRef.current.background = texture;
        sceneRef.current.environment = texture;
      }
    );

    addGrid();

    var points = [],
      polygon = new THREE.Mesh(
        new THREE.BufferGeometry(),
        new THREE.MeshBasicMaterial({
          color: "crimson",
          transparent: true,
          opacity: 0.4,
          side: THREE.DoubleSide,
          depthTest: false,
        })
      );

    sceneRef.current.add(polygon);

    rendererRef.current.render(sceneRef.current, cameraRef.current);

    function drawPolygon(position) {
      console.log(position);
      // draw a black circle to indicate dot position
      var point = new THREE.Mesh(
        new THREE.CircleGeometry(0.5),
        new THREE.MeshBasicMaterial({ color: "black" })
      );
      point.position.set(position.x, position.y, position.z);
      sceneRef.current.add(point);

      // add the point to the list of points
      points.push(new THREE.Vector2(position.x, position.y));

      // generate a shape from the points
      shapeRef.current = new THREE.Shape();
      shapeRef.current.moveTo(...points[0]);
      for (var i = 0; i < points.length; i++)
        shapeRef.current.lineTo(...points[i]);
      shapeRef.current.lineTo(...points[0]);

      // generate a mesh geometry from the shape
      polygon.geometry.dispose();
      polygon.geometry = new THREE.ShapeGeometry(shapeRef.current);

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }

    raycasterRef.current = new MyRaycaster(
      canvasRef.current,
      sceneRef.current,
      cameraRef.current,
      controlsRef.current,
      drawPolygon
    );

    const extrude = (button_name) => {
      const extrudeSettings = {
        steps: 2,
        depth: 20,
        bevelOffset: 0,
        bevelSegments: 1,
      };

      const geometry = new THREE.ExtrudeGeometry(
        shapeRef.current,
        extrudeSettings
      );
      const material = new THREE.MeshStandardMaterial({
        color: 0x5e5e5e,
        transparent: false,
        opacity: 0,
      });
      const mesh = new THREE.Mesh(geometry, material);
      sceneRef.current.add(mesh);
      console.log(mesh);
    };

    setRoofDesignerAction(() => extrude);

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

export default RoofEditor;
