import * as React from 'react';
import * as ReactDOM from 'react-dom';

import '../public/index.html';
import { Grapher } from './Grapher';

import { GraphController } from './ui/GraphController';

const grapher = new Grapher(document.getElementById('graph') as HTMLElement);
grapher.animate();

function onResizeDone() {
  let timeout: number;
  return function () {
    clearTimeout(timeout);
    // MUST USE window. to avoid confusion with node settimeout
    timeout = window.setTimeout(() => grapher.updateSize(), 250);
  };
}
window.addEventListener('resize', onResizeDone());

ReactDOM.render(
  <GraphController
    grapher={grapher}
  />,
  document.getElementById('ui') as HTMLElement,
);

// TODO this is a little hacky. maybe fix it
class DragHandlerClass {
  down: boolean;
  ui: HTMLElement;
  graph: HTMLElement;
  bar: HTMLElement;
  grapher: Grapher;
  constructor(grapher: Grapher) {
    this.grapher = grapher;
    this.down = false;
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.graph = document.getElementById('graph') as HTMLElement;
    this.ui = document.getElementById('ui') as HTMLElement;
    this.bar = document.getElementById('bar') as HTMLElement;
  }
  onMouseMove(e: Event) {
    if (!this.down) {
      return;
    }
    const fraction =
      ((e as MouseEvent).clientX - this.bar.clientWidth / 2) / document.body.clientWidth;
    this.graph.style.width = `${fraction * 100}%`;
    this.ui.style.width = `${99 - fraction * 100}%`;
  }
  onMouseDown(e: Event) {
    if (e.target !== this.bar) {
      return;
    }
    e.preventDefault();
    this.down = true;
  }
  onMouseUp(e: Event) {
    if (this.down === true) {
      console.log('up');
      grapher.updateSize();
      this.down = false;
    }
  }
}
const dh = new DragHandlerClass(grapher);
document.addEventListener('mousedown', dh.onMouseDown);
document.addEventListener('mouseup', dh.onMouseUp);
document.addEventListener('mousemove', dh.onMouseMove);
