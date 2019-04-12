/*
 * TODO improve this header
 * TODO allow every aspect of a curve to be controlled
 * TODO make sure the equation is valid and if it is not display an error
 *
 * This component represents all of the controls related to a curve.
 */
import { h, render, Component } from 'preact';
import linkstate from 'linkstate';

import { Grapher } from '../Grapher';
import { Curve } from '../curves/Curve';

export interface CurveControllerProps {
  curveKey: number;
  grapher: Grapher;
}

interface CurveControllerState {
  rawEquation: string;
  curve: Curve;
}

export class CurveController
extends Component<CurveControllerProps, CurveControllerState> {
  constructor(props: CurveControllerProps) {
    super(props);
    const curve = this.props.grapher.getCurve(props.curveKey) as Curve;
    this.state = {
      curve,
      rawEquation: curve.equation.rawEquation,
    };
    this.updateCurveEquation = this.updateCurveEquation.bind(this);
  }
  updateCurveEquation(e: Event) {
    const maybeError = this.state.curve.updateEquation(this.state.rawEquation);
    if (maybeError !== null) {
      console.log(maybeError as Error);
    }
  }
  render(props: CurveControllerProps, state: CurveControllerState) {
    return (
      <span>
        <input
         type="text"
         value={ state.rawEquation }
         onInput={ linkstate(this, 'rawEquation') }
         onBlur={ this.updateCurveEquation }
        />
      </span>
    );
  }
}
