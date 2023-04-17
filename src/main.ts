import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { scene1, scene2, scene3, scene4 } from './scenes';

// Essentials
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer();
const orbitControls = new OrbitControls(camera, renderer.domElement);
// Configs



// scene1(scene, camera, renderer, orbitControls);
// scene2(scene, camera, renderer, orbitControls);
// scene3(scene, camera, renderer, orbitControls);

scene4(scene, camera, renderer, orbitControls);
