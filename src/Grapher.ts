import * as THREE from 'three';
import { OrbitControls } from 'three-orbitcontrols-ts';

import { Curve } from './Curve';

// TODO SHOULD RESIZE ON WINDOW RESIZE
export class Grapher {
  scene: THREE.Scene;
  camera: THREE.Camera;
  renderer: THREE.Renderer;
  controls: OrbitControls;

  lastCurveKey: number = 0;
  curves: Map<number, Curve> = new Map<number, Curve>();

  constructor(elem: HTMLElement) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, elem.clientWidth / elem.clientHeight,
                                              0.1, 1000);
    this.camera.up = new THREE.Vector3(0, 0, 1);
    this.camera.position.set(0, 0, 2);

    this.controls = new OrbitControls(this.camera, elem);
    this.controls.minDistance = 0;
    this.controls.maxDistance = Infinity;
    this.controls.enableKeys = false;
    this.controls.update();

    const pLight = new THREE.PointLight(0xffffff, 1, 10, 2);
    const pLightHelper = new THREE.PointLightHelper(pLight);
    pLight.position.set(0, 0, 1);
    // this.scene.add(pLightHelper);
    this.scene.add(pLight);
    const directionalLight = new THREE.DirectionalLight(0x404040, 0.5);
    directionalLight.translateOnAxis(new THREE.Vector3(0, 0, 1).normalize(), 2);
    const helper = new THREE.DirectionalLightHelper(directionalLight, 1);
    // this.scene.add(directionalLight);
    // this.scene.add(helper);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(elem.clientWidth, elem.clientHeight);
    elem.appendChild(this.renderer.domElement);
  }
  addCurve() : (number | null) {
    this.curves.set(this.lastCurveKey, new Curve());
    const lastCurve = this.curves.get(this.lastCurveKey) as Curve;
    const helper = new THREE.VertexNormalsHelper(lastCurve.mesh, .1, 0x00ff00, 1);
    this.scene.add(lastCurve.mesh);
    // this.scene.add(helper);
    this.lastCurveKey += 1;
    return this.lastCurveKey - 1;
  }
  removeCurve(key: number) : boolean {
    const toBeRemoved = this.curves.get(key);
    if (toBeRemoved === undefined) {
      return false;
    }
    this.scene.remove(toBeRemoved.mesh);
    toBeRemoved.dispose();
    return true;
  }
  getCurve(key: number) : (Curve | undefined) {
    return this.curves.get(key);
  }
  animate() {
    requestAnimationFrame(this.animate.bind(this));

    this.controls.update();

    this.renderer.render(this.scene, this.camera);
  }
}
