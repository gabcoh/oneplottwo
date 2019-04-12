/*
 * TODO Improve error messages
 * TODO throw errors in lexer if appropriate
 * TODO consider returning errors so that typescript knows there type
 * TODO maybe let each curve/equation class implement parse equation
 * TODO parse equation should return an equation. Not an ast
 *
 * This file implements dikstra's shunting yard algorithm to parse arithmetic expressions.
 * Raw equations are first passed to the lexer which tokenizes them and labels each token,
 * with it's type (eg. variable/function, constant, operator). The tokens are then passed
 * to the shunting yard which parses the tokens into an AST and throws some errors in the
 * case of malformed equations.
 *
 * So far, equations can consist of functions, parenthized expressions, and binary operators.
 * Prefix operators should work, but none are implemented and for that reasons there also
 * are no tests for them.
 * Names of functions and variables can not contain numbers!
 *
 */
import { EquationTypes } from './equations/EquationTypes';
import { ExplicitRectangularEquation } from './equations/RectangularEquations';
import { Equation } from './equations/Equation';

export enum Associativity {
  LEFT,
  RIGHT,
}

export interface Operator {
  name: string;
  precedence: number;
  // have the option to return errro but I am not using that at the moment
  func: (...params: number[]) => (Error | number);
  associativity?: Associativity;
  arity: number;
  prefix?: boolean;
}
const PAREN_OPERATOR: Operator = {
  name: 'PAREN',
  precedence: -1,
  arity: -1,
  func(...params: number[]) {
    return new Error('You should never call = as function');
  },
};
const functions: Map<string, Operator> = new Map([
  ['sum', {
    name: 'EXP',
    precedence: 4,
    arity: 2,
    func(...params: number[]) {
      return params.reduce((a, b) => a + b);
    },
  }],
]);
const operators: Map<string, Operator> = new Map([
  ['^', {
    name: 'EXP',
    precedence: 4,
    arity: 2,
    associativity: Associativity.RIGHT,
    func(...params: number[]) {
      return Math.pow(params[0], params[1]);
    },
  }],
  ['*', {
    name: 'MULT',
    precedence: 3,
    arity: 2,
    associativity: Associativity.RIGHT,
    func(...params: number[]) {
      return params[0] * params[1];
    },
  }],
  ['/', {
    name: 'DIV',
    precedence: 3,
    arity: 2,
    associativity: Associativity.RIGHT,
    func(...params: number[]) {
      return params[0] / params[1];
    },
  }],
  ['+', {
    name: 'ADD',
    precedence: 2,
    arity: 2,
    associativity: Associativity.RIGHT,
    func(...params: number[]) {
      return params[0] + params[1];
    },
  }],
  ['-', {
    name: 'SUB',
    precedence: 2,
    arity: 2,
    associativity: Associativity.RIGHT,
    func(...params: number[]) {
      return params[0] - params[1];
    },
  }],
  ['=', {
    name: 'EQ',
    precedence: 1,
    arity: 2,
    associativity: Associativity.RIGHT,
    func(...params: number[]) {
      return new Error('You should never call = as function');
    },
  }],
]);

export enum TokenTypes {
  OPERATOR,
  NAME,
  CONSTANT,
  COMMA,
  PAREN,
}

export interface Token {
  kind: TokenTypes;
  value: string;
  column: number;
}
function lexer(raw: string): Token[] {
  let currentToken: string = '';
  let currentTokenStart: number = 0;
  const tokens: Token[] = [];
  for (let i = 0; i < raw.length; i = i + 1) {
    if (/[() ,]/.test(raw[i]) || operators.has(raw[i])) {
      if (/[0-9]+/.test(currentToken)) {
        tokens.push({
          kind: TokenTypes.CONSTANT,
          value: currentToken,
          column: currentTokenStart,
        });
      } else if (currentToken !== '') {
        tokens.push({
          kind: TokenTypes.NAME,
          value: currentToken,
          column: currentTokenStart,
        });
      }
      if (operators.has(raw[i])) {
        tokens.push({
          kind: TokenTypes.OPERATOR,
          value: raw[i],
          column: i,
        });
      } else if (/[,()]/.test(raw[i])) {
        tokens.push({
          kind: raw[i] === ',' ? TokenTypes.COMMA : TokenTypes.PAREN,
          value: raw[i],
          column: i,
        });
      }
      currentToken = '';
      currentTokenStart = i + 1;
    } else {
      currentToken += raw[i];
    }
  }
  if (/[0-9]+/.test(currentToken)) {
    tokens.push({
      kind: TokenTypes.CONSTANT,
      value: currentToken,
      column: currentTokenStart,
    });
  } else if (currentToken !== '') {
    tokens.push({
      kind: TokenTypes.NAME,
      value: currentToken,
      column: currentTokenStart,
    });
  }
  return tokens;
}

export interface ASTFuncNode {
  operator: Operator;
  operands: ASTNode[];
}
export type ASTNode = number | string | ASTFuncNode;

function applyNextOperator(operatorStack: Operator[], operandStack: ASTNode[]) {
  if (operatorStack.length === 0) {
    throw new Error('inssuficient operators');
  }
  const topOp: Operator = operatorStack.pop() as Operator;
  if (topOp.arity > operandStack.length) {
    throw new Error('insuffiecnt operands');
  }
  const ops = [];
  for (let i = 0; i < topOp.arity; i = i + 1) {
    ops.unshift(operandStack.pop() as ASTNode);
  }
  operandStack.push({
    operator: topOp,
    operands: ops,
  });
}
// Just so i don't forget a function is a name followed by a paren,
// a var is a name not followed by a paren
function shuntingYard(tokens: Token[]): ASTNode {
  const operatorStack: Operator[] = [];
  const operandStack: ASTNode[] = [];
  const functionParens = new Set();
  const functionOperandStack: {
    operands: ASTNode[],
  }[] = [];
  let previousToken: (Token | undefined) = undefined;
  for (let i = 0; i < tokens.length; i = i + 1) {
    switch (tokens[i].kind) {
      case (TokenTypes.CONSTANT):
        operandStack.push(Number(tokens[i].value));
        break;
      case(TokenTypes.NAME):
        operandStack.push(tokens[i].value);
        break;
      case(TokenTypes.OPERATOR):
        // Lexer already checked that token exists in operators map
        const currentOp = operators.get(tokens[i].value) as Operator;
        if (previousToken === undefined ||
          (previousToken as Token).kind === TokenTypes.OPERATOR &&
          currentOp.arity === 1 && !(currentOp.prefix as boolean)) {
          throw new Error('incorrect use of unary operator');
        }
        while (true) {
          if (operatorStack.length !== 0 &&
            !(currentOp.arity === 1 && operatorStack[operatorStack.length - 1].arity > 1) &&
            operatorStack[operatorStack.length - 1].precedence >= currentOp.precedence) {
            applyNextOperator(operatorStack, operandStack);
          } else {
            break;
          }
        }
        operatorStack.push(currentOp);
        break;
      case(TokenTypes.PAREN):
        if (tokens[i].value === '(') {
          operatorStack.push(PAREN_OPERATOR);
          if ((previousToken as Token).kind === TokenTypes.NAME) {
            functionOperandStack.push({
              operands: [],
            });
            functionParens.add(operatorStack.length);
          }
        } else {
          while (operatorStack[operatorStack.length - 1] !== PAREN_OPERATOR) {
            applyNextOperator(operatorStack, operandStack);
          }
          operatorStack.pop();
          if (operandStack.length === 0) {
            throw new Error('function error!!!');
          }
          // +1 because poped paren off already
          if (functionParens.delete(operatorStack.length + 1)) {
            functionOperandStack[functionOperandStack.length - 1].operands.push(
              operandStack.pop() as ASTNode);
            const funcOperands = functionOperandStack[functionOperandStack.length - 1].operands;
            const fun = operandStack.pop() as string;
            // I can't remember if this was already checked
            if (!functions.has(fun)) {
              throw new Error(`function ${fun} is not defined`);
            }
            operandStack.push({
              operator: functions.get(fun) as Operator,
              operands: funcOperands,
            });
            functionOperandStack.pop();
          }
        }
        break;
      case(TokenTypes.COMMA):
        while (operatorStack[operatorStack.length - 1] !== PAREN_OPERATOR) {
          applyNextOperator(operatorStack, operandStack);
        }
        if (operandStack.length === 0) {
          throw new Error('empty function argument');
        }
        functionOperandStack[functionOperandStack.length - 1].operands.push(
          operandStack.pop() as ASTNode);
        break;
    }
    previousToken = tokens[i];
  }
  // This is repeated from above
  while (operatorStack.length !== 0) {
    if (operatorStack[operatorStack.length - 1] === PAREN_OPERATOR) {
      throw new Error('unmatched left paren');
    }
    applyNextOperator(operatorStack, operandStack);
  }
  if (operatorStack.length !== 0 || operandStack.length !== 1) {
    throw new Error('equation error');
  }

  return operandStack[0];
}

export function isAnASTFuncNode(obj: any): obj is ASTFuncNode {
  return typeof obj === 'object' && 'operator' in obj && 'operands' in obj;
}
// Remember if mor etypes are added to ASTNode to do propper checking
function countVariables(ast: ASTNode): string[] {
  if (typeof ast === 'string') {
    return [ast];
  }
  if (isAnASTFuncNode(ast)) {
    let vars: string[] = [];
    for (let i = 0; i < ast.operands.length; i = i + 1) {
      vars = vars.concat(countVariables(ast.operands[i]));
    }
    return vars;
  }
  return [];
}
export function parseEquation(rawEquation: string): (Equation | Error) {
  try {
    const ast = shuntingYard(lexer(rawEquation));
    if (!(isAnASTFuncNode(ast)) ||
      (ast as ASTFuncNode).operator !== (operators.get('=') as Operator)) {
      return new Error('Equation does not have two expressions set equal');
    }
    // If there is not a side with a single variable (out of x, y, z) on it then
    // treat it as implicit
    const leftVars = new Set(countVariables(ast.operands[0]));
    const rightVars = new Set(countVariables(ast.operands[1]));
    const allVars = new Set([...leftVars, ...rightVars]);

    // Figure out where independent var is and what it is
    if (leftVars.size === 1 && (leftVars.has('x') || leftVars.has('X'))) {
      return new ExplicitRectangularEquation(rawEquation, 'x', ast.operands[1]);
    }
    if (leftVars.size === 1 && (leftVars.has('z') || leftVars.has('Z'))) {
      return new ExplicitRectangularEquation(rawEquation, 'z', ast.operands[1]);
    }
    if (leftVars.size === 1 && (leftVars.has('y') || leftVars.has('Y'))) {
      return new ExplicitRectangularEquation(rawEquation, 'y', ast.operands[1]);
    }
    if (rightVars.size === 1 && (rightVars.has('x') || rightVars.has('X'))) {
      return new ExplicitRectangularEquation(rawEquation, 'x', ast.operands[0]);
    }
    if (rightVars.size === 1 && (rightVars.has('z') || rightVars.has('Z'))) {
      return new ExplicitRectangularEquation(rawEquation, 'z', ast.operands[0]);
    }
    if (rightVars.size === 1 && (rightVars.has('y') || rightVars.has('Y'))) {
      return new ExplicitRectangularEquation(rawEquation, 'y', ast.operands[0]);
    }
    return new Error(`cannot parse ${rawEquation} as Rectangular`);
  } catch (e) {
    if (e instanceof Error) {
      return e;
    }
    throw e;
  }
}
const __PRIVATE__ = {
  lexer,
  operators,
  functions,
  shuntingYard,
  countVariables,
};
export {
  __PRIVATE__,
};
