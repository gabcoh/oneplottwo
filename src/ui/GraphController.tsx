/*
 * TODO only load preact/debug when in debug mode
 * TODO improve this header
 *
 * This component handles displaying a list of every curve.
 */
import * as React from 'react';
import { OrderedSet } from 'immutable';

import { Grapher } from '../Grapher';

import { CurveController } from './CurveController';

export interface GraphControllerProps {
  grapher: Grapher;
}

interface GraphControllerState {
  curveKeys: OrderedSet<number>;
}

export class GraphController extends React.Component<GraphControllerProps, GraphControllerState> {
  constructor(props: GraphControllerProps) {
    super(props);
    this.state = {
      curveKeys: OrderedSet<number>(),
    };
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
  render(): React.ReactNode {
    return (
      <span>
        <ul>
          { [...this.state.curveKeys].map(this.renderCurve) }
        </ul>
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
