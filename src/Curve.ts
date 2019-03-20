import * as THREE from 'three';

import { RectangularBounds } from './Bounds';
import { Equation } from './Equation';
// This is really just for functions of z=f(x,y) but I'll deal with that later
// Also, maybe call this Curve and the actual function Function
export class Curve {
  // Number of points in each direction for mesh
  points: number;
  // Just a string that gets evalled for now, should soon become a more complicated parsed object
  equation: Equation;

  // TODO IMPLEMENT BOUNDS OBJECT
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
    this.equation = new Equation('x*y');
    // Set to a reasonable default
    this.points = 10;

    this.geometry = new THREE.BufferGeometry();
    this.updateBuffers();
    // Must explicitly set to infinity for whatever reason
    // This caused hours of headache...
    this.geometry.setDrawRange(0, Infinity);

    this.material = new THREE.MeshPhongMaterial({
      side: THREE.DoubleSide,
      specular: 0xffffff,
      shininess: 1,
      wireframe: false,
      vertexColors: THREE.VertexColors,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  // only need to update indicies when number of points changes
  updateBuffers() {
    const [vertices, colors, normals] = this.generatePointsColorsAndNormals();
    this.geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
    this.geometry.addAttribute('normal', new THREE.BufferAttribute(normals, 3));
    this.geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
    const indicies = this.generateIndicies();
    this.geometry.setIndex(new THREE.BufferAttribute(indicies, 1));
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

        colors[base + 0] = (x - this.bounds.minX) * 255 / xRange;
        colors[base + 1] = (y - this.bounds.minY) * 255 / yRange;
        colors[base + 2] = 0;
      }
    }
    return [vertices, colors, normals];
  }
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
  updateEquation(rawEquation: string) : (Error | null) {
    try {
      this.equation = new Equation(rawEquation);
    } catch (e) {
      return e;
    }
    this.updateBuffers();
    return null;
  }
}
