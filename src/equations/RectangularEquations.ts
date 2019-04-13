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
  evaluate(x: number, y: number) {
    const vars = new Map<string, number>([['x', x], ['y', y]]);
    return evaluateAST(this.ast, vars);
  }
  derivate(x: number, y: number, delta: number): [number, number] {
    const vars = new Map<string, number>([['x', x], ['y', y]]);
    const fxy = evaluateAST(this.ast, vars);
    vars.set('x', x + delta);
    const dfx = evaluateAST(this.ast, vars) - fxy;
    vars.set('x', x);
    vars.set('y', y + delta);
    const dfy = evaluateAST(this.ast, vars) - fxy;
    return [dfx / delta, dfy / delta];
  }
}
