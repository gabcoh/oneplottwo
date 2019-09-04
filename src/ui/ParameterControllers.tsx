/*
 * TODO Maybe they should all share a parameter controller super class?
 *
 * Implements the controllers for each type of curve parameter
 *
 */

import * as React from 'react';
import { HuePicker, ColorResult } from 'react-color';
import linkstate from 'linkstate';

import { Grapher } from '../Grapher';
import { Curve } from '../curves/Curve';
import { ColorParameter, NumberParameter } from '../ParameterTypes';

export interface ColorParameterControllerProps {
  param: ColorParameter;
}

interface ColorParameterControllerState {
}

export class ColorParameterController
extends React.Component<ColorParameterControllerProps, ColorParameterControllerState> {
  constructor(props: ColorParameterControllerProps) {
    super(props);
    this.onColorChanged = this.onColorChanged.bind(this);
  }
  render(): React.ReactNode {
    const color = this.props.param.getValue();
    return (
      <HuePicker
        color={{ r: color >> 16, g: (color >> 8) & 0xff, b: color & 0xff }}
        onChangeComplete={ this.onColorChanged }
      />
    );
  }
  onColorChanged(color: ColorResult) {
    this.props.param.updateValue((color.rgb.r << 16) + (color.rgb.g << 8) + color.rgb.b);
  }
}

export interface NumberParameterControllerProps {
  param: NumberParameter;
}

interface NumberParameterControllerState {
  value: string;
}

export class NumberParameterController
extends React.Component<NumberParameterControllerProps, NumberParameterControllerState> {
  constructor(props: NumberParameterControllerProps) {
    super(props);
    this.state = {
      value: props.param.getValue().toString(),
    };
  }
  maybeSetValue() {
    if (isNaN(Number.parseFloat(this.state.value))) {
      return;
    }
    this.props.param.updateValue(Number.parseFloat(this.state.value));
  }
  render(): React.ReactNode {
    return <input
    type="number" 
    value={this.state.value} 
    onChange={linkstate(this, "value")}
    onBlur={this.maybeSetValue.bind(this)}
    />;
  }
}
