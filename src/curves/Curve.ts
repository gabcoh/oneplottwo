/*
 * TODO improve this documentation header
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

export abstract class Curve {
  // Number of points in each direction for mesh
  points: number;

  equation: Equation;

  specular = 0xffffff;
  color: number;
  shininess = 10;

  bounds: RectangularBounds;

  abstract geometry: THREE.BufferGeometry;
  abstract material: THREE.Material;
  abstract mesh: THREE.Object3D;

  constructor(defaultEquation: string, bounds: RectangularBounds) {
    // Set to a reasonable default
    this.bounds = bounds;

    this.points = 10;
    this.color = Math.floor(Math.random() * 0xffffff);

    this.equation = parseEquation(defaultEquation) as Equation;
  }
  setPoints(points: number) {
    this.points = points;
  }
  setBounds(bounds: RectangularBounds) {
    this.bounds = bounds;
  }
  getParameters(): Map<string, Map<string, ParameterType<any>>> {
    return new Map([
      ['appearance', new Map([
        ['color', new ColorParameter(
          () => { return this.color; },
          (color: number) => { this.color = color; this.updateBuffers(); })],
        ['shininess', new NumberParameter(
          () => { return this.shininess; },
          (color: number) => { this.shininess = color; this.reMesh(); }, 0, 100)],
      ])],
      ['rendering', new Map([
        ['points', new NumberParameter(
          () => { return this.points; },
          (points: number) => { this.points = points; this.updateBuffers(); }, 0, 100)],
      ])],
    ]);
  }
  reMesh() {
    if (this.material !== undefined && this.mesh !== undefined) {
      this.dispose();
    }
    this.material = new THREE.MeshPhongMaterial({
      side: THREE.DoubleSide,
      specular: this.specular,
      shininess: this.shininess,
      wireframe: false,
      vertexColors: THREE.VertexColors,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }
  // only need to update indicies when number of points changes
  updateBuffers() {
    const [vertices, colors, normals] = this.generatePointsColorsAndNormals();

    if ('position' in this.geometry.attributes) {
      const attribute = this.geometry.attributes['position'] as THREE.BufferAttribute;
      attribute.setArray(vertices);
      attribute.needsUpdate = true;
    } else {
      this.geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
    }

    if ('normal' in this.geometry.attributes) {
      const attribute = this.geometry.attributes['normal'] as THREE.BufferAttribute;
      attribute.setArray(normals);
      attribute.needsUpdate = true;
    } else {
      this.geometry.addAttribute('normal', new THREE.BufferAttribute(normals, 3));
    }

    if ('color' in this.geometry.attributes) {
      const attribute = this.geometry.attributes['color'] as THREE.BufferAttribute;
      attribute.setArray(colors);
      attribute.needsUpdate = true;
    } else {
      this.geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
    }
    const indicies = this.generateIndicies();
    this.geometry.setIndex(new THREE.BufferAttribute(indicies, 1));
  }

  // TODO Seperate these out. they don't need to be bound together
  abstract generatePointsColorsAndNormals(): [Float32Array, Float32Array, Float32Array];

  generateIndicies(): Uint32Array {
    const indicies = new Uint32Array((this.points - 1) * (this.points - 1) * 2 * 3);
    for (let i = 0; i < this.points - 1; i += 1) {
      for (let j = 0; j < this.points - 1; j += 1) {
        const base = i * (this.points - 1) * 6 + (j * 6);
        const a = i * this.points + j + 1;
        const b = i * this.points + j;
        const c = (i + 1) * this.points + j;
        const d = (i + 1) * this.points + j + 1;

        indicies[base + 0] = d;
        indicies[base + 1] = b;
        indicies[base + 2] = a;

        indicies[base + 3] = d;
        indicies[base + 4] = c;
        indicies[base + 5] = b;
      }
    }
    return indicies;
  }
  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
  abstract updateEquation(rawEquation: string) : (Error | null);
}
