import CannonDebugger from 'cannon-es-debugger';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import sunTexture from './assets/img/sunmap.jpg';
import mercuryTexture from './assets/img/mercurymap.jpg';
import venusTexture from './assets/img/venusmap.jpg';
import earthTexture from './assets/img/earthmap.jpg';
import marsTexture from './assets/img/marsmap.jpg';
import saturnTexture from './assets/img/saturnmap.jpg';
import jupiterTexture from './assets/img/jupitermap.jpg';
import uranusTexture from './assets/img/uranusmap.jpg';
import neptuneTexture from './assets/img/neptunemap.jpg';
import plutoTexture from './assets/img/plutomap.jpg';

export const scene1 = (scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, orbitControls: OrbitControls) => {
    const clock = new THREE.Clock();
    camera.position.set(14, 5, 24);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const uniformData = {
        u_time: {
            type: 'f',
            value: clock.getElapsedTime(),
        }
    };
    const render = () => {
        uniformData.u_time.value = clock.getElapsedTime();
        window.requestAnimationFrame(render);
    }
    render();

    const geometry = new THREE.BoxGeometry(20, 2, 20, 50, 50, 50);
    const material = new THREE.ShaderMaterial({
        wireframe: true,
        uniforms: uniformData,
        vertexShader: `
        // varying são variáveis que podem passar pelo vertexShader e pelo fragmentShader
        // uniform são variáveis que vêm do programa (campo uniforms do ShaderMaterial)
        varying vec3 pos; 
        uniform float u_time;
        
        void main() {
            vec4 result;
            pos = position;

            result = vec4(position.x, cos((position.x/2.0) + u_time) + cos((position.z/4.0) + u_time) + position.y, position.z, 1.0);
            gl_Position = projectionMatrix * modelViewMatrix * result;
        }
    `,
        fragmentShader: `
        varying vec3 pos;
        uniform float u_time;

        void main() {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
            // if (pos.x >= 0.0)
            //     gl_FragColor = vec4(abs(sin(u_time)), 0.0, 0.0, 1.0);
            // else
            //     gl_FragColor = vec4(0.0, abs(cos(u_time)), 0.0, 1.0);
        }
    `});
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    function animate() {
        orbitControls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();
}

export const scene2 = (scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, orbitControls: OrbitControls) => {
    const initialTarget = new THREE.Vector3(0, 2, 0);
    const clock = new THREE.Clock();
    camera.position.set(10, 5, 10);
    camera.lookAt(initialTarget);
    orbitControls.target = initialTarget;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);



    const physicsWorld = new CANNON.World({
        gravity: new CANNON.Vec3(0, -9.82, 0),
    });
    const groundBody = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Plane(),
    });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    physicsWorld.addBody(groundBody);

    const sphereBody = new CANNON.Body({
        mass: 5,
        shape: new CANNON.Sphere(1),
    });
    sphereBody.position.set(0, 7, 0);
    physicsWorld.addBody(sphereBody);

    const boxBody = new CANNON.Body({
        mass: 5,
        shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
    });
    boxBody.position.set(1, 10, 0);
    physicsWorld.addBody(boxBody);

    const sphereGeometry = new THREE.SphereGeometry(1);
    const sphereMaterial = new THREE.ShaderMaterial({
        uniforms: {
            u_time: {
                type: 'f',
                value: clock.getElapsedTime(),
            }
        },
        vertexShader: `
            precision mediump float;

            void main() {
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y, position.z, 1.0);
            }
        `,
        fragmentShader: `
            precision mediump float;
            uniform vec2 u_resolution;
            uniform float u_time;

            void main() {
                vec2 coord = gl_FragCoord.xy / u_resolution;
                vec3 color = vec3(abs(sin(u_time)), abs(cos(u_time)), abs(cos(u_time)));

                // color += sin(coord.x * cos(u_time/30.0) * 60.0) * sin(coord.y * cos(u_time/15.0) * 10.0); 
                gl_FragColor = vec4(color, 1.0);
            }
        `
    });
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphereMesh);

    const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
    const boxMaterial = new THREE.MeshNormalMaterial();
    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    scene.add(boxMesh);

    // CANNON DEBUGGER ##################
    const cannonDebugger = CannonDebugger(scene, physicsWorld, {
        // color: 0xff0000,
    });

    function animate() {
        physicsWorld.fixedStep();
        // cannonDebugger.update();
        orbitControls.update();

        sphereMesh.position.copy(sphereBody.position);
        sphereMesh.quaternion.copy(sphereBody.quaternion);

        boxMesh.position.copy(boxBody.position);
        boxMesh.quaternion.copy(boxBody.quaternion);

        sphereMaterial.uniforms.u_time.value = clock.getElapsedTime();

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();
}

export const scene3 = (scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, orbitControls: OrbitControls) => {
    const initialTarget = new THREE.Vector3(0, 2, 0);
    camera.position.set(10, 5, 10);
    camera.lookAt(initialTarget);
    orbitControls.target = initialTarget;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const physicsWorld = new CANNON.World({
        gravity: new CANNON.Vec3(0, -9.82, 0),
    });
    const cannonDebugger = CannonDebugger(scene, physicsWorld, {
        // color: 0xff0000,
    });



    const groundBody = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Plane(),
    });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    physicsWorld.addBody(groundBody);

    const axisWidth = 5;
    const down = new CANNON.Vec3(0, -1, 0);
    const wheelMass = 1;
    const wheelShape = new CANNON.Sphere(1);
    const wheelMaterial = new CANNON.Material('wheel');

    const carBody = new CANNON.Body({
        mass: 20,
        position: new CANNON.Vec3(0, 6, 0),
        shape: new CANNON.Box(new CANNON.Vec3(4, 0.5, 2)),
    });

    const vehicle = new CANNON.RigidVehicle({
        chassisBody: carBody,
    });
    const wheel1Body = new CANNON.Body({ mass: wheelMass, material: wheelMaterial });
    wheel1Body.addShape(wheelShape);
    wheel1Body.angularDamping = 0.4;
    const wheel2Body = new CANNON.Body({ mass: wheelMass, material: wheelMaterial });
    wheel2Body.addShape(wheelShape);
    wheel2Body.angularDamping = 0.4;
    const wheel3Body = new CANNON.Body({ mass: wheelMass, material: wheelMaterial });
    wheel3Body.addShape(wheelShape);
    wheel3Body.angularDamping = 0.4;
    const wheel4Body = new CANNON.Body({ mass: wheelMass, material: wheelMaterial });
    wheel4Body.addShape(wheelShape);
    wheel4Body.angularDamping = 0.4;

    const carMesh = new THREE.Mesh(new THREE.BoxGeometry(8, 1, 4), new THREE.MeshNormalMaterial());
    scene.add(carMesh);
    const wheel1Mesh = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshNormalMaterial());
    scene.add(wheel1Mesh);
    const wheel2Mesh = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshNormalMaterial());
    scene.add(wheel2Mesh);
    const wheel3Mesh = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshNormalMaterial());
    scene.add(wheel3Mesh);
    const wheel4Mesh = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshNormalMaterial());
    scene.add(wheel4Mesh);


    vehicle.addWheel({
        body: wheel1Body,
        position: new CANNON.Vec3(-2, -1, axisWidth / 2),
        axis: new CANNON.Vec3(0, 0, 1),
        direction: down,
    })
    vehicle.addWheel({
        body: wheel2Body,
        position: new CANNON.Vec3(-2, -1, -axisWidth / 2),
        axis: new CANNON.Vec3(0, 0, 1),
        direction: down,
    })
    vehicle.addWheel({
        body: wheel3Body,
        position: new CANNON.Vec3(2, -1, axisWidth / 2),
        axis: new CANNON.Vec3(0, 0, 1),
        direction: down,
    })
    vehicle.addWheel({
        body: wheel4Body,
        position: new CANNON.Vec3(2, -1, -axisWidth / 2),
        axis: new CANNON.Vec3(0, 0, 1),
        direction: down,
    })
    vehicle.addToWorld(physicsWorld);


    function animate() {
        physicsWorld.fixedStep();
        cannonDebugger.update();
        orbitControls.update();

        carMesh.position.copy(carBody.position);
        carMesh.quaternion.copy(carBody.quaternion);
        wheel1Mesh.position.copy(wheel1Body.position);
        wheel1Mesh.quaternion.copy(wheel1Body.quaternion);
        wheel2Mesh.position.copy(wheel2Body.position);
        wheel2Mesh.quaternion.copy(wheel2Body.quaternion);
        wheel3Mesh.position.copy(wheel3Body.position);
        wheel3Mesh.quaternion.copy(wheel3Body.quaternion);
        wheel4Mesh.position.copy(wheel4Body.position);
        wheel4Mesh.quaternion.copy(wheel4Body.quaternion);


        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();


    document.addEventListener('keydown', (e) => {
        const maxSteerVal = Math.PI / 8;
        const maxForce = 100;

        switch (e.key) {
            case 'w':
            case 'ArrowUp':
                vehicle.setWheelForce(maxForce, 0);
                vehicle.setWheelForce(maxForce, 1);
                break;

            case 's':
            case 'ArrowDown':
                vehicle.setWheelForce(-maxForce / 2, 0);
                vehicle.setWheelForce(-maxForce / 2, 1);
                break;

            case 'a':
            case 'ArrowLeft':
                vehicle.setSteeringValue(maxSteerVal, 0);
                vehicle.setSteeringValue(maxSteerVal, 1);
                break;

            case 'd':
            case 'ArrowRight':
                vehicle.setSteeringValue(-maxSteerVal, 0);
                vehicle.setSteeringValue(-maxSteerVal, 1);
                break;
        }
    });
    document.addEventListener('keyup', (e) => {
        switch (e.key) {
            case 'w':
            case 'ArrowUp':
                vehicle.setWheelForce(0, 0);
                vehicle.setWheelForce(0, 1);
                break;

            case 's':
            case 'ArrowDown':
                vehicle.setWheelForce(0, 0);
                vehicle.setWheelForce(0, 1);
                break;

            case 'a':
            case 'ArrowLeft':
                vehicle.setSteeringValue(0, 0);
                vehicle.setSteeringValue(0, 1);
                break;

            case 'd':
            case 'ArrowRight':
                vehicle.setSteeringValue(0, 0);
                vehicle.setSteeringValue(0, 1);
                break;
        }
    });
}

export const scene4 = (scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, orbitControls: OrbitControls) => {
    camera.position.set(200, 20, 200);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);
    const textureLoader = new THREE.TextureLoader();

    const planetTextures: object = {
        'sun': sunTexture,
        'mercury': mercuryTexture,
        'venus': venusTexture,
        'earth': earthTexture,
        'mars': marsTexture,
        'saturn': saturnTexture,
        'jupiter': jupiterTexture,
        'uranus': uranusTexture,
        'neptune': neptuneTexture,
        'pluto': plutoTexture
    };


    const ambientLight = new THREE.AmbientLight(0xffffff, .2);
    scene.add(ambientLight);


    const sun = new THREE.Mesh(
        new THREE.SphereGeometry(16.51, 200, 200),
        new THREE.MeshBasicMaterial({
            map: textureLoader.load(sunTexture),
        })
    );
    const sunPointLight = new THREE.PointLight(0xFFFFFF, 2, 200);
    sunPointLight.castShadow = true;
    sun.add(sunPointLight);
    scene.add(sun);

    const createNewPlanet = (planetName: string, distanceFromSun: number, size: number) => {
        const planet = new THREE.Mesh(
            new THREE.SphereGeometry(size),
            new THREE.MeshStandardMaterial({
                map: textureLoader.load(planetTextures[planetName]),
            })
        );
        planet.castShadow = true;
        planet.receiveShadow = true;

        const planetOrbit = new THREE.Object3D();
        planetOrbit.position.copy(sun.position);
        planet.position.x = distanceFromSun;
        planetOrbit.add(planet);
        scene.add(planetOrbit);

        return { planet, planetOrbit };
    }

    const planetSizeMultiplier = 2;

    const { planet: mercury, planetOrbit: mercuryObj } = createNewPlanet('mercury', 20, 0.058 * planetSizeMultiplier);
    const { planet: venus, planetOrbit: venusObj } = createNewPlanet('venus', 30, 0.14 * planetSizeMultiplier);
    const { planet: earth, planetOrbit: earthObj } = createNewPlanet('earth', 40, 0.15 * planetSizeMultiplier);
    const { planet: mars, planetOrbit: marsObj } = createNewPlanet('mars', 50, 0.08 * planetSizeMultiplier);
    const { planet: jupiter, planetOrbit: jupiterObj } = createNewPlanet('jupiter', 60, 1.7 * planetSizeMultiplier);
    const { planet: saturn, planetOrbit: saturnObj } = createNewPlanet('saturn', 70, 1.4 * planetSizeMultiplier);
    const { planet: uranus, planetOrbit: uranusObj } = createNewPlanet('uranus', 80, 0.6 * planetSizeMultiplier);
    const { planet: neptune, planetOrbit: neptuneObj } = createNewPlanet('neptune', 90, 0.6 * planetSizeMultiplier);
    const { planet: pluto, planetOrbit: plutoObj } = createNewPlanet('pluto', 100, 0.03 * planetSizeMultiplier);


    const animate = () => {
        sun.rotateY(0.0001);

        mercury.rotateY(0.001);
        venus.rotateY(0.001);
        earth.rotateY(0.001);
        mars.rotateY(0.001);
        jupiter.rotateY(0.001);
        saturn.rotateY(0.001);
        uranus.rotateY(0.001);
        neptune.rotateY(0.001);
        pluto.rotateY(0.001);

        mercuryObj.rotateY(0.0011);
        venusObj.rotateY(0.001);
        earthObj.rotateY(0.0009);
        marsObj.rotateY(0.0008);
        jupiterObj.rotateY(0.0007);
        saturnObj.rotateY(0.0006);
        uranusObj.rotateY(0.0005);
        neptuneObj.rotateY(0.0004);
        plutoObj.rotateY(0.0003);

        orbitControls.update();
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
}