import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three/webgpu';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { WaterMesh } from 'three/addons/objects/Water2Mesh.js';
import { GroundedSkybox } from 'three/addons/objects/GroundedSkybox.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const canvasHostRef = useRef(null);
  const touchTimeRef = useRef(0);
  const [activeTagline, setActiveTagline] = useState(0);
  const [exitTagline, setExitTagline] = useState(-1);

  const taglines = [
    'Elevate your everyday.',
    'The art of living well.',
    'Intentional living, curated.'
  ];

  useEffect(() => {
    let exitCleanupTimeoutId;

    const intervalId = window.setInterval(() => {
      setActiveTagline((prev) => {
        setExitTagline(prev);
        return (prev + 1) % taglines.length;
      });

      window.clearTimeout(exitCleanupTimeoutId);
      exitCleanupTimeoutId = window.setTimeout(() => {
        setExitTagline(-1);
      }, 950);
    }, 3000);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(exitCleanupTimeoutId);
    };
  }, [taglines.length]);

  useEffect(() => {
    let camera;
    let scene;
    let renderer;
    let controls;
    let water;
    let envMap;
    let normal0;
    let normal1;

    const host = canvasHostRef.current;
    if (!host) {
      return undefined;
    }

    const onResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const init = async () => {
      try {
        scene = new THREE.Scene();

        renderer = new THREE.WebGPURenderer({ antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        host.appendChild(renderer.domElement);

        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 500);
        camera.position.set(0, 1.5, 8);

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.enablePan = false;
        controls.maxDistance = camera.far / 2;
        controls.minDistance = 2;
        controls.maxPolarAngle = THREE.MathUtils.degToRad(90);
        controls.target.set(0, 1, 0);
        controls.update();

        window.addEventListener('resize', onResize);

        const hdrLoader = new HDRLoader();
        envMap = await hdrLoader.loadAsync('https://happy358.github.io/Images/HDR/old_hall_2k.hdr');
        envMap.mapping = THREE.EquirectangularReflectionMapping;

        const skybox = new GroundedSkybox(envMap, 15, camera.far / 2);
        skybox.position.y = 14;
        scene.add(skybox);

        const textureLoader = new THREE.TextureLoader();
        [normal0, normal1] = await Promise.all([
          textureLoader.loadAsync('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/water/Water_1_M_Normal.jpg'),
          textureLoader.loadAsync('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/water/Water_2_M_Normal.jpg')
        ]);
        normal0.wrapS = normal0.wrapT = THREE.RepeatWrapping;
        normal1.wrapS = normal1.wrapT = THREE.RepeatWrapping;

        water = new WaterMesh(new THREE.CircleGeometry(camera.far / 2, 32), {
          color: 'azure',
          scale: 5,
          flowDirection: new THREE.Vector2(0.1, 0.3),
          normalMap0: normal0,
          normalMap1: normal1
        });
        water.position.set(0, 0, 0);
        water.rotation.x = Math.PI * -0.5;
        water.renderOrder = Number.POSITIVE_INFINITY;
        scene.add(water);

        renderer.setAnimationLoop(() => {
          controls.update();
          renderer.render(scene, camera);
        });
      } catch (error) {
        console.error('Landing scene initialization failed', error);
      }
    };

    init();

    return () => {
      window.removeEventListener('resize', onResize);

      if (renderer) {
        renderer.setAnimationLoop(null);
      }

      if (controls) {
        controls.dispose();
      }

      if (water) {
        water.geometry?.dispose();
        if (Array.isArray(water.material)) {
          water.material.forEach((material) => material.dispose?.());
        } else {
          water.material?.dispose?.();
        }
      }

      normal0?.dispose?.();
      normal1?.dispose?.();
      envMap?.dispose?.();

      if (renderer) {
        renderer.dispose();
        if (renderer.domElement.parentNode === host) {
          host.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  const openLogin = () => {
    navigate('/login');
  };

  const handleTitleTouchEnd = () => {
    const now = Date.now();
    if (now - touchTimeRef.current < 320) {
      navigate('/login');
    }
    touchTimeRef.current = now;
  };

  return (
    <div className="landing-scene">
      <div ref={canvasHostRef} className="landing-canvas-host" aria-hidden="true" />

      <div id="landing-ui">
        <header>
          <h1 onDoubleClick={openLogin} onTouchEnd={handleTitleTouchEnd} title="Double-tap to login">
            Olive &amp; Oak
          </h1>
        </header>

        <div id="landing-tagline">
          {taglines.map((line, index) => {
            const isActive = index === activeTagline;
            const isExiting = index === exitTagline;
            return (
              <span key={line} className={`${isActive ? 'active' : ''} ${isExiting ? 'exit' : ''}`.trim()}>
                {line}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Landing;
