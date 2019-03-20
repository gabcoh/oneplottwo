import { h, render } from 'preact';

import '../public/index.html';
import { Grapher } from './Grapher';

import { GraphController } from './ui/GraphController';

const grapher = new Grapher(document.getElementById('graph') as HTMLElement);
grapher.animate();

render(<GraphController grapher={grapher} />, document.getElementById('ui') as HTMLElement);
