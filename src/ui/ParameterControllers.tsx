/*
 * TODO Maybe they should all share a parameter controller super class?
 *
 * Implements the controllers for each type of curve parameter
 *
 */

import { h, render, Component } from 'preact';
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
extends Component<ColorParameterControllerProps, ColorParameterControllerState> {
  constructor(props: ColorParameterControllerProps) {
    super(props);
    this.state = {
    };
  }
  render(props: ColorParameterControllerProps, state: ColorParameterControllerState) {
    return <p> { props.param.getValue() } </p>;
  }
}

export interface NumberParameterControllerProps {
  param: NumberParameter;
}

interface NumberParameterControllerState {
}

export class NumberParameterController
extends Component<NumberParameterControllerProps, NumberParameterControllerState> {
  constructor(props: NumberParameterControllerProps) {
    super(props);
    this.state = {
    };
  }
  render(props: NumberParameterControllerProps, state: NumberParameterControllerState) {

    return <p> { props.param.getValue() } </p>;
  }
}
