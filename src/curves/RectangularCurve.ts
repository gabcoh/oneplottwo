/*
 * TODO improve this documentation header
 * TODO Consider the fact that equation is of type Equation not a more accurate and more
 *  specific type. This can be fixed maybe by changing the way Curve sets equation in constructor.
 *  Instead of using updateEquation use an abstract setter for equation that Curve calls so
 *  each class can make sure equation is of the correct type
 *
 * This class represents a curve to be graphed (the whole reason we're here). Right now
 * it is just called curve, but it soon should become a super class of each curve type.
 * At the moment it is really just an explicit curve.
 *
 * The curve class is responsible for the Threejs Object3d of the curve. This class
 * creates all of the webgl buffers, initializes and generates geometry, and chooses shaders.
 *
 */
import * as THREE from 'three';

import { RectangularBounds } from '../Bounds';
import { Equation, isExplicitRectangular } from '../equations/Equation';
import { parseEquation } from '../EquationParser';
import { ParameterType, ColorParameter, NumberParameter } from '../ParameterTypes';
import { Curve } from './Curve';

export class RectangularCurve extends Curve {

  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  mesh: THREE.Object3D;

  constructor(bounds: RectangularBounds) {
    super('z=x*y', bounds);

    this.bounds = bounds;

    this.geometry = new THREE.BufferGeometry();
    // calling elsewhere
    this.updateBuffers();
    // Must explicitly set to infinity for whatever reason
    // This caused hours of headache...
    this.geometry.setDrawRange(0, Infinity);

    this.material = new THREE.MeshPhongMaterial({
      side: THREE.DoubleSide,
      specular: this.specular,
      shininess: this.shininess,
      wireframe: false,
      vertexColors: THREE.VertexColors,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }
  getParameters(): Map<string, Map<string, ParameterType<any>>> {
    return new Map([...super.getParameters()]);
  }
  generatePointsColorsAndNormals(): [Float32Array, Float32Array, Float32Array] {
    const vertices = new Float32Array(this.points * this.points * 3);
    const normals = new Float32Array(this.points * this.points * 3);
    const colors = new Float32Array(this.points * this.points * 3);

    let  aRange = this.bounds.maxX - this.bounds.minX;
    let  bRange = this.bounds.maxY - this.bounds.minY;
    let  minA = this.bounds.minX;
    let  minB = this.bounds.minY;
    let  dependentInd = 2;
    let  aDep = 0;
    let  bDep = 1;
    console.log(this.equation.independentVariable === 'x');
    if (this.equation.independentVariable === 'x') {
      aRange = this.bounds.maxY - this.bounds.minY;
      bRange = this.bounds.maxZ - this.bounds.minZ;
      minA = this.bounds.minY;
      minB = this.bounds.minZ;
      dependentInd = 0;
      aDep = 1;
      bDep = 2;
    } else if (this.equation.independentVariable === 'Y') {
      aRange = this.bounds.maxX - this.bounds.minX;
      bRange = this.bounds.maxZ - this.bounds.minZ;
      minA = this.bounds.minX;
      minB = this.bounds.minZ;
      dependentInd = 1;
      aDep = 0;
      bDep = 2;
    }
    for (let i = 0; i < this.points; i += 1) {
      for (let j = 0; j < this.points; j += 1) {
        const base = i * this.points * 3 + j * 3;
        const a = (j / (this.points - 1)) * aRange + minA;
        const b = (i / (this.points - 1)) * bRange + minB;

        vertices[base + aDep] = a;
        vertices[base + bDep] = b;
        vertices[base + dependentInd] = this.equation.evaluate(a, b);

        const [da, db] = this.equation.derivate(a, b, aRange / 1000);
        const va = new THREE.Vector3(1, 0, da);
        const vb = new THREE.Vector3(0, 1, db);
        va.cross(vb);
        normals[base + aDep] = va.x;
        normals[base + bDep] = va.y;
        normals[base + dependentInd] = va.z;

        colors[base + 0] = (this.color >> 16) / 255;
        colors[base + 1] = ((this.color >> 8) & 0xff) / 255;
        colors[base + 2] = (this.color & 0xff) / 255;
      }
    }
    return [vertices, colors, normals];
  }
  updateEquation(rawEquation: string) : (Error | null) {
    const eqOrError = parseEquation(rawEquation);

    if (eqOrError instanceof Error) {
      return eqOrError;
    }
    if (isExplicitRectangular(eqOrError)) {
      this.equation = eqOrError;
      this.updateBuffers();
    } else {
      console.log('only explicit rectangular equations are supported right now');
    }
    return null;
  }
}
