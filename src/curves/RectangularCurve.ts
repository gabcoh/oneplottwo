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
  bounds: RectangularBounds = {
    minX: -1,
    maxX: 1,
    minY: -1,
    maxY: 1,
    minZ: -1,
    maxZ: 1,
  };
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  mesh: THREE.Object3D;

  constructor() {
    super('z=x*y');
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
    const xRange = this.bounds.maxX - this.bounds.minX;
    const yRange = this.bounds.maxY - this.bounds.minY;
    for (let i = 0; i < this.points; i += 1) {
      for (let j = 0; j < this.points; j += 1) {
        const base = i * this.points * 3 + j * 3;
        const x = (j / (this.points - 1)) * xRange + this.bounds.minX;
        const y = (i / (this.points - 1)) * yRange + this.bounds.minY;

        vertices[base + 0] = x;
        vertices[base + 1] = y;
        vertices[base + 2] = this.equation.evaluate(x, y);

        const [dx, dy] = this.equation.derivate(x, y, xRange / 1000);
        const vx = new THREE.Vector3(1, 0, dx);
        const vy = new THREE.Vector3(0, 1, dy);
        vx.cross(vy);
        normals[base + 0] = vx.x;
        normals[base + 1] = vx.y;
        normals[base + 2] = vx.z;

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
