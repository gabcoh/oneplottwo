/*
 * TODO only load preact/debug when in debug mode
 * TODO improve this header
 *
 * This component handles displaying a list of every curve.
 */
import * as React from 'react';
import { OrderedSet } from 'immutable';
import linkstate from 'linkstate';

import { Grapher } from '../Grapher';

import { RectangularBounds } from '../Bounds';
import { CurveController } from './CurveController';

export interface GraphControllerProps {
  grapher: Grapher;
}

interface GraphControllerState {
  curveKeys: OrderedSet<number>;
  minX: string;
  minY: string;
  minZ: string;
  maxX: string;
  maxY: string;
  maxZ: string;
}

export class GraphController extends React.Component<GraphControllerProps, GraphControllerState> {
  constructor(props: GraphControllerProps) {
    super(props);
    this.state = {
      curveKeys: OrderedSet<number>(),
      minX: props.grapher.bounds.minX.toString(),
      minY: props.grapher.bounds.minY.toString(),
      minZ: props.grapher.bounds.minZ.toString(),
      maxX: props.grapher.bounds.maxX.toString(),
      maxY: props.grapher.bounds.maxY.toString(),
      maxZ: props.grapher.bounds.maxZ.toString(),
    }

    this.updateBounds = this.updateBounds.bind(this);
  }
  addRectangularCurve = () => {
    const maybeNextKey = this.props.grapher.addRectangularCurve();
    if (maybeNextKey != null) {
      this.setState({
        curveKeys: this.state.curveKeys.add(maybeNextKey),
      });
    } else {
      // Display error to user
      console.error('EQUATION LIMIT REACHED');
    }
  }
  removeCurve = (key: number) => () => {
    this.props.grapher.removeCurve(key);
    this.setState({ curveKeys: this.state.curveKeys.delete(key) });
  }
  renderCurve = (key: number) => {
    return (
      <div key={key}>
      <CurveController grapher={this.props.grapher} curveKey={key}/>
      <button onClick={ this.removeCurve(key) }> X </button>
      </div>
    );
  }
  updateBounds() {
    const maybeBounds = this.getBounds();
    if (maybeBounds === null) {
      console.log("A dimension is not a number");
      return;
    }
    this.props.grapher.updateBounds(this.getBounds() as RectangularBounds) 
  }
  getBounds(): (RectangularBounds | null) {
    let maybeBounds: RectangularBounds = {
      minX: Number.parseFloat(this.state.minX),
      maxX: Number.parseFloat(this.state.maxX),
      minY: Number.parseFloat(this.state.minY),
      maxY: Number.parseFloat(this.state.maxY),
      minZ: Number.parseFloat(this.state.minZ),
      maxZ: Number.parseFloat(this.state.maxZ),
    };
    for (let [key, values] of Object.entries(maybeBounds)) {
      if (isNaN(values)) {
        return null;
      }
    }
    return maybeBounds;
  }
  renderDimensions() {
    return ( 
      <div className={"dimensions"}>
      <h5> Dimensions </h5>
      <ul>
        <li> 
          <input 
            type="number" 
            value={ this.state.minX }
            onChange={linkstate(this, 'minX')}
            onBlur={this.updateBounds}
          /> 
          &lt; x &gt;
          <input 
            type="number" 
            value={ this.state.maxX }
            onChange={linkstate(this, 'maxX')}
            onBlur={this.updateBounds}
          />
        </li>
        <li> 
          <input 
            type="number" 
            value={ this.state.minY }
            onChange={linkstate(this, 'minY')}
            onBlur={this.updateBounds}
          /> 
          &lt; x &gt;
          <input 
            type="number" 
            value={ this.state.maxY }
            onChange={linkstate(this, 'maxY')}
            onBlur={this.updateBounds}
          />
        </li>
        <li> 
          <input 
            type="number" 
            value={ this.state.minZ }
            onChange={linkstate(this, 'minZ')}
            onBlur={this.updateBounds}
          /> 
          &lt; x &gt;
          <input 
            type="number" 
            value={ this.state.maxZ }
            onChange={linkstate(this, 'maxZ')}
            onBlur={this.updateBounds}
          />
        </li>
        </ul>
      </div>
    );
  }
  render(): React.ReactNode {
    return (
      <span>
        <ul>
          { [...this.state.curveKeys].map(this.renderCurve) }
        </ul>
      { this.renderDimensions() }
        <button
          onClick={this.addRectangularCurve}
          className="center"
        >
          add rectangular curve
        </button>
      </span>
    );
  }
}
