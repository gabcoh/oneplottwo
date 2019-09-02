/*
 * TODO improve this header
 * TODO allow every aspect of a curve to be controlled
 * TODO make sure the equation is valid and if it is not display an error
 *
 * This component represents all of the controls related to a curve.
 */
import * as React from 'react';
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
extends React.Component<CurveControllerProps, CurveControllerState> {
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
  updateCurveEquation() {
    const maybeError = this.state.curve.updateEquation(this.state.rawEquation);
    if (maybeError !== null) {
      console.log(maybeError);
    }
  }
  createParameters(map: Map<string, ParameterType<any>>) {
    const params = [];
    for (const [key, value] of map.entries()) {
      if (value instanceof NumberParameter) {
        params.push(<li key={key}> <NumberParameterController param={ value } /> </li>);
      } else if (value instanceof ColorParameter) {
        params.push(<li key={key}> <ColorParameterController param={ value } /> </li>);
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
      elements.push(<li key={key}> { key } <ul> { this.createParameters(value) } </ul> </li>);
    }
    return elements;
  }
  render(): React.ReactElement {
    return (
      <span>
        <input
         type="text"
         value={ this.state.rawEquation }
         onChange={ linkstate(this, 'rawEquation') }
         onBlur={ this.updateCurveEquation }
        />
        <ul>
          { this.createParameterElements() }
        </ul>
      </span>
    );
  }
}
