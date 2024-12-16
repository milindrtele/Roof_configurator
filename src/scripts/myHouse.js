import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

class MyHouse {
  constructor(scene, url) {
    this.scene = scene;
    this.url = url;
    this.loadedTextures = [];
    this.roofParentObject = null;
    this.roofMaterial = null;
    this.texture_data = null; // Holds the texture data fetched from the JSON
    this.init();
  }

  // Fetch texture data from JSON file
  async findTextureData(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch texture data:", error);
      return null;
    }
  }

  // Find texture data for a specific roof texture name
  async find_From_Data(name) {
    if (!this.texture_data) {
      this.texture_data = await this.findTextureData(
        "/json/texture_paths.json"
      );
    }
    return this.texture_data?.find((item) => item.roofTextureName === name);
  }

  // Load GLTF model and set up scene
  loadGlb() {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(
        this.url,
        (gltf) => {
          this.scene.add(gltf.scene);
          this.roofParentObject = gltf.scene.getObjectByName("roof_parent");
          gltf.scene.traverse((obj) => {
            if (obj.isMesh) {
              obj.castShadow = true;
              obj.receiveShadow = true;
            }
          });
          resolve();
        },
        undefined, // Progress callback
        (error) => {
          console.error("Error loading GLB:", error);
          reject(error);
        }
      );
    });
  }

  // Load textures based on texture name
  async loadTextures(name) {
    const textureData = await this.find_From_Data(name);
    if (!textureData || !textureData.roofTexturePath) {
      console.error("No texture paths found for the specified name.");
      return;
    }

    const roofTexturePaths = textureData.roofTexturePath;
    const loader = new THREE.TextureLoader();

    // Load all textures asynchronously
    const texturePromises = roofTexturePaths.map(
      (path) =>
        new Promise((resolve, reject) => {
          loader.load(
            path,
            (texture) => {
              texture.wrapS = THREE.RepeatWrapping;
              texture.wrapT = THREE.RepeatWrapping;
              texture.repeat.set(1, 1);
              resolve(texture);
            },
            undefined,
            (error) => reject(error)
          );
        })
    );

    try {
      this.loadedTextures = await Promise.all(texturePromises);
      console.log("All textures are loaded.");
    } catch (error) {
      console.error("Error loading textures:", error);
    }
  }

  // Apply textures to the roof material and assign it to the roof objects
  changeRoofMaterialTextures() {
    if (this.loadedTextures.length === 4 && this.roofParentObject) {
      const [base, roughness, normal, ao] = this.loadedTextures;

      this.roofMaterial = new THREE.MeshStandardMaterial({
        map: base,
        roughnessMap: roughness,
        normalMap: normal,
        aoMap: ao,
      });

      this.roofParentObject.traverse((obj) => {
        if (obj.isMesh) {
          obj.material = this.roofMaterial;
        }
      });

      console.log("Roof material textures applied.");
    } else {
      console.error(
        "Textures are not fully loaded or roofParentObject is missing."
      );
    }
  }

  // Initialize and load everything
  init() {
    this.loadGlb()
      .then(() => this.loadTextures("pineCrest_charcoal"))
      .then(() => this.changeRoofMaterialTextures())
      .catch((error) => {
        console.error("Error initializing MyHouse:", error);
      });
  }
}

export default MyHouse;
