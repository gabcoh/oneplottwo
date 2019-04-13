/*
 * TODO consider converting curves map to an immutable map (just consider it, not a must)
 * TODO graph should resize on window resize events
 * TODO only redraw graph when there is some view change (don't just requestAnimationFrame)
 * TODO improve lighting
 *
 * This file implements the class responsible for coordinating the drawing of every curve.
 * This class is the steward of the scene graph and controls when to redraw it, where lights
 * are, and everything else related to the 3d rendering which is not handled by each individual
 * curve. In order to be drawn, this class must be made aware of the object.
 *
 * Because I am scared of object references, in order to refer to a specific curve, when it is
 * first added, this class provides a key for the curve which is just a random number. This key
 * is used to obtain a reference to the curve, manipulate it, and remove it from the scene graph
 * when the time comes.
 *
 * This class should be the only one manipulating curves. It is acceptable for other code to
 * read from curve objects, but this class is responsible for all mutations.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three-orbitcontrols-ts';

import { Curve } from './curves/Curve';
import { RectangularCurve } from './curves/RectangularCurve';

export class Grapher {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.Renderer;
  controls: OrbitControls;

  lastCurveKey: number = 0;
  curves: Map<number, Curve> = new Map<number, Curve>();

  domElement: HTMLElement;

  constructor(elem: HTMLElement) {
    this.domElement = elem;
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

    const pLightTop = new THREE.PointLight(0xffffff, 1, 10, 2);
    const pLightBottom = new THREE.PointLight(0xffffff, 1, 10, 2);
    // const pLightHelper = new THREE.PointLightHelper(pLight);
    pLightTop.position.set(0, 0, 1.5);
    pLightBottom.position.set(0, 0, -1.5);
    // this.scene.add(pLightHelper);
    // this.scene.add(pLightTop);
    this.scene.add(pLightBottom);
    const directionalLightTop = new THREE.DirectionalLight(0x404040, 0.5);
    directionalLightTop.translateOnAxis(new THREE.Vector3(0, 0, 1).normalize(), 2);
    const helper = new THREE.DirectionalLightHelper(directionalLightTop, 1);
    this.scene.add(directionalLightTop);
    // this.scene.add(helper);
    const axesHelper = new THREE.AxesHelper();
    this.scene.add(axesHelper);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(elem.clientWidth, elem.clientHeight);
    elem.appendChild(this.renderer.domElement);
  }
  addRectangularCurve(): (number | null) {
    return this.addCurve(new RectangularCurve());
  }
  addCurve(curve: Curve) : (number | null) {
    this.curves.set(this.lastCurveKey, curve);
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
  updateSize() {
    console.log('update size');
    this.camera.aspect = this.domElement.clientWidth / this.domElement.clientHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.domElement.clientWidth, this.domElement.clientHeight);
  }
}
