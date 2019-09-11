/*
 * TODO improve this header
 * TODO fix error handling in eval
 */

import { ASTNode } from '../EquationParser';
import { evaluateAST } from '../ASTEvaluator';

export class ExplicitRectangularEquation {
  kind: string[] = ['explicit', 'rectangular'];

  rawEquation: string;
  independentVariable: string;

  ast: ASTNode;

  constructor(rawEquation: string, ind: string, ast: ASTNode) {
    this.rawEquation = rawEquation;
    this.independentVariable = ind;
    this.ast = ast;
  }
  evaluate(a: number, b: number) {
    let vars = new Map<string, number>([['y', a], ['z', b]]);
    if (this.independentVariable === 'z') {
      vars = new Map<string, number>([['x', a], ['y', b]]);
    } else if (this.independentVariable === 'y') {
      vars = new Map<string, number>([['x', a], ['z', b]]);
    }
    return evaluateAST(this.ast, vars);
  }
  derivate(valA: number, valB: number, delta: number): [number, number] {
    let vars = new Map<string, number>([['y', valA], ['z', valB]]);
    let varA = 'y';
    let varB = 'z';
    if (this.independentVariable === 'z') {
      vars = new Map<string, number>([['x', valA], ['y', valB]]);
      varA = 'x';
      varB = 'y';
    } else if (this.independentVariable === 'y') {
      vars = new Map<string, number>([['x', valA], ['z', valB]]);
      varA = 'x';
      varB = 'z';
    }
    const fab = evaluateAST(this.ast, vars);
    vars.set(varA, valA + delta);
    const dfa = evaluateAST(this.ast, vars) - fab;
    vars.set(varA, valA);
    vars.set(varB, valB + delta);
    const dfb = evaluateAST(this.ast, vars) - fab;
    return [dfa / delta, dfb / delta];
  }
}
