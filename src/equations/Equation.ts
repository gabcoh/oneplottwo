/*
 * TODO implement custom type guards here
 *
 * Checks kind to determine type of equation. First element is either imp or
 * exp second is coord system
 */
import { ExplicitRectangularEquation } from './RectangularEquations';

export type Equation = ExplicitRectangularEquation;

export function isExplicitRectangular(a: any): a is ExplicitRectangularEquation {
  return a.kind[0] === 'explicit' && a.kind[1] === 'rectangular';
}
