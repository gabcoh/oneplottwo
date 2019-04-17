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
import { ColorParameter, NumberParameter, ParameterType } from '../ParameterTypes';

import { NumberParameterController, ColorParameterController } from './ParameterControllers';

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
    this.createParameterElements = this.createParameterElements.bind(this);
    this.createParameters = this.createParameters.bind(this);
  }
  updateCurveEquation(e: Event) {
    const maybeError = this.state.curve.updateEquation(this.state.rawEquation);
    if (maybeError !== null) {
      console.log(maybeError);
    }
  }
  createParameters(map: Map<string, ParameterType<any>>) {
    const params = [];
    for (const [key, value] of map.entries()) {
      if (value instanceof NumberParameter) {
        params.push(<li> <NumberParameterController param={ value } /> </li>);
      } else if (value instanceof ColorParameter) {
        params.push(<li> <ColorParameterController param={ value } /> </li>);
      } else {
        console.error(`key: ${ key } has value: ${ value } of unknown type`);
      }
    }
    return params;
  }
  createParameterElements() {
    const params = this.state.curve.getParameters();
    const elements = [];
    for (const [key, value] of params.entries()) {
      elements.push(<li> { key } <ul> { this.createParameters(value) } </ul> </li>);
    }
    return elements;
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
        <ul>
          { this.createParameterElements() }
        </ul>
      </span>
    );
  }
}
