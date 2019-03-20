
// Really just cartesian but generalize later (when you even figure out how to plot other curves)
// TODO Make this not so naive. Actually parse equation into something real (DONT JUST EVAL IDIOT)
export class Equation {
  rawEquation: string;

  constructor(rawEquation: string) {
    this.rawEquation = rawEquation;
  }
  evaluate(x: number, y: number) {
    return eval(this.rawEquation);
  }
  derivate(bx: number, by: number, delta: number): [number, number] {
    let x = bx;
    let y = by;
    const fxy = eval(this.rawEquation);
    x = x + delta;
    const dfx = eval(this.rawEquation) - fxy;
    x = bx;
    y = y + delta;
    const dfy = eval(this.rawEquation) - fxy;
    return [dfx / delta, dfy / delta];
  }
}
