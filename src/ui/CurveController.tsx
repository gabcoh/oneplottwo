import { h, render, Component } from 'preact';
import linkstate from 'linkstate';

import { Grapher } from '../Grapher';
import { Curve } from '../Curve';

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
    // TODO check if valid
    const maybeError = this.state.curve.updateEquation(this.state.rawEquation);
    if (maybeError !== null) {
      console.log(maybeError as Error);
    }
  }
  render(props: CurveControllerProps, state: CurveControllerState) {
    return (
      <div>
        <input
         type="text"
         value={ state.rawEquation }
         onInput={ linkstate(this, 'rawEquation') }
         onBlur={ this.updateCurveEquation }
        />
      </div>
    );
  }
}
