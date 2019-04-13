/*
 * TODO implement it
 *
 * this file implements everything neceseery to evalue an ast.
 */
import { isAnASTFuncNode, ASTNode } from './EquationParser';

export function evaluateAST(ast: ASTNode, vars: Map<string, number>): number {
  if (isAnASTFuncNode(ast)) {
    const params: (Error | number)[] = ast.operands.map(a => evaluateAST(a, vars));
    for (let i = 0; i < params.length; i = i + 1) {
      if (typeof params[i] !== 'number') {
        throw  new Error(`${params[i]} is not a number`);
      }
    }
    const valOrError = ast.operator.func(...params as number[]);
    if (valOrError instanceof Error) {
      throw valOrError;
    }
    return valOrError as number;
  }
  if (typeof ast === 'string') {
    if (vars.has(ast)) {
      return vars.get(ast) as number;
    }
    throw new Error(`variable ${ast} is undefined`);
  }
  if (typeof ast === 'number') {
    return ast;
  }
  throw new Error('unknown type of astnode');
}
