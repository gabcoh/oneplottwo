/*
 * This set of classes extends the ParameterType abstract class and provide the
 * information to allow a controller to accuratly control the parameters. ParameterTypes
 * both receive enough info to update the parameters on the actual objects themselves
 * (they store reference to object and property name of parameter)
 */
export abstract class ParameterType<T> {
  update: (up: T) => void;
  getter: () => T;
  constructor(getter: () => T, update: (up: T) => void) {
    this.update = update;
    this.getter = getter;
  }
  updateValue(val: T) {
    this.update(val);
  }
  getValue(): T {
    return this.getter();
  }
}

export class ColorParameter extends ParameterType<number> {
  // Just to differentiate from a normal number param incase that is necessery
  kind = 'color';
}
export class NumberParameter extends ParameterType<number> {
  kind = 'number';
  start: number;
  end: number;
  constructor(getter: () => number, update: (up: number) => void, start: number, end: number) {
    super(getter, update);
    this.start = start;
    this.end = end;
  }
}
