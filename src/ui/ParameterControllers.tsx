/*
 * TODO Maybe they should all share a parameter controller super class?
 *
 * Implements the controllers for each type of curve parameter
 *
 */

import * as React from 'react';
import { HuePicker } from 'react-color';

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
  }
  render(): React.ReactNode {
    const color = this.props.param.getValue();
    return (
      <HuePicker
        color={{ r: color >> 16, g: (color >> 8) & 0xff, b: color & 0xff }}
        onChangeComplete={ (color) => { this.props.param.updateValue((color.rgb.r << 16) + (color.rgb.g << 8) + color.rgb.b); } }
      />
    );
  }
}

export interface NumberParameterControllerProps {
  param: NumberParameter;
}

interface NumberParameterControllerState {
}

export class NumberParameterController
extends React.Component<NumberParameterControllerProps, NumberParameterControllerState> {
  constructor(props: NumberParameterControllerProps) {
    super(props);
    this.state = {
    };
  }
  render(): React.ReactNode {
    return <p> { this.props.param.getValue() } </p>;
  }
}
