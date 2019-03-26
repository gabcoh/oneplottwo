/*
 * TODO improve this header
 */
export interface RectangularEquation {
  rawEquation: string;

  evaluate(x: number): number;
  derivate(bx: number, by: number, delta: number): [number, number];
}
