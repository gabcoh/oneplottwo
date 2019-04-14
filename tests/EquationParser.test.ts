
import { real, MersenneTwister19937 } from 'random-js';

import * as parser from '../src/EquationParser';
import { ExplicitRectangularEquation } from '../src/equations/RectangularEquations';

const lexer = parser.__PRIVATE__.lexer;
const shuntingYard = parser.__PRIVATE__.shuntingYard;
const countVariables = parser.__PRIVATE__.countVariables;
const ops = parser.__PRIVATE__.operators;
const functions = parser.__PRIVATE__.functions;

// Make token (return object to ignore column because that would be annoying)
function mkt(t: parser.TokenTypes, s: string): Object {
  return {
    kind: t,
    value: s,
  };
}
// Make constant
function mkc(s: string): Object {
  return mkt(parser.TokenTypes.CONSTANT, s);
}
// Make operator 
function mko(s: string): Object {
  return mkt(parser.TokenTypes.OPERATOR, s);
}
const lp = mkt(parser.TokenTypes.PAREN, '(');
const rp = mkt(parser.TokenTypes.PAREN, ')');
const c =  mkt(parser.TokenTypes.COMMA, ',');
describe('lexer', () => {
  test('correctly lexes', () => {
    let expected = [mkc('1'), mko('+'), mkc('2')];
    expect(lexer('1+2')).toMatchObject(expected);
    expect(lexer(' 1 +2')).toMatchObject(expected);
    expect(lexer(' 1 + 2 ')).toMatchObject(expected);

    expected = [mkc('1'), mko('+'), lp, mkc('2'), mko('*'), mkc('3'), rp];
    expect(lexer('1+(2*3)')).toMatchObject(expected);
    expect(lexer('   1+  (  2* 3 )')).toMatchObject(expected);
    expected = [mkc('1'), mko('+'), lp, mkc('2'), mko('*'), mkt(parser.TokenTypes.NAME, 'fake'), 
      lp, mkc('3'), c, mkc('1'), mko('+'), mkc('2'), rp, rp];
    expect(lexer('1+(2*fake(3, 1+2))')).toMatchObject(expected);
    expect(lexer('1 +(2 *fake (  3,  1+ 2)   )')).toMatchObject(expected);
  });
});
describe('shunting yard', () => {
  test('correctly shunts simple expressions', () => {
    let expected: parser.ASTNode = {
      operator: ops.get('+') as parser.Operator,
      operands: [1, 2],
    };
    expect(shuntingYard(lexer('1+2'))).toEqual(expected);
    expect(() => {
      shuntingYard(lexer('1+ 2 +'))
    }).toThrow();
  });
  test('correctly shunts complex expressions', () => {
    // TODO better testing
    let expected: parser.ASTNode = {
      operator: ops.get('=') as parser.Operator,
      operands: [7, {
        operator: ops.get('+') as parser.Operator,
        operands: [1, {
          operator: ops.get('*') as parser.Operator,
          operands: [2, {
            operator: ops.get('^') as parser.Operator,
            operands: [3, 2],
          },]
        },]
      },],
    };
    expect(shuntingYard(lexer('7 = 1+2 * 3^2'))).toEqual(expected);
  });
  test('correctly shunts parenthised expressions', () => {
    let expected: parser.ASTNode = {
      operator: ops.get('*') as parser.Operator,
      operands: [1, {
        operator: ops.get('+') as parser.Operator,
        operands: [2, 3],
      }],
    };
    expect(shuntingYard(lexer('1 * (2 + 3)'))).toEqual(expected);
    expected = {
      operator: ops.get('*') as parser.Operator,
      operands: [1, {
        operator: ops.get('*') as parser.Operator,
        operands: [2, {
          operator: ops.get('*') as parser.Operator,
          operands: [2, {
            operator: ops.get('+') as parser.Operator,
            operands: [2, 3],
          }],
        }],
      }],
    };
    expect(shuntingYard(lexer('1 * (2 * (2 * (2 + 3)))'))).toEqual(expected);
    expect(() => {
      shuntingYard(lexer('1+ 2 * ( 3+ 1'))
    }).toThrow();
  });
  test('correctly shunts expressions with function calls', () => {
    let expected: parser.ASTNode = {
      operator: functions.get('sum') as parser.Operator,
      operands: [1, 2],
    };
    expect(shuntingYard(lexer('sum(1, 2)'))).toEqual(expected);
    expected = {
      operator: functions.get('sum') as parser.Operator,
      operands: [{
        operator: functions.get('sum') as parser.Operator,
        operands: [1, 2],
      }, 2],
    };
    expect(shuntingYard(lexer('sum(sum(1, 2), 2)'))).toEqual(expected);

    expected = {
      operator: ops.get('+') as parser.Operator,
      operands: [1, {
        operator: functions.get('sum') as parser.Operator,
        operands: [{
          operator: ops.get('+') as parser.Operator,
          operands: [1, 2],
        }, {
          operator: ops.get('*') as parser.Operator,
          operands: [1, {
            operator: ops.get('+') as parser.Operator,
            operands: [{
              operator: functions.get('sum') as parser.Operator,
              operands: [1, 2],
            }, 3],
          }],
        }],
      }],
    };
    expect(shuntingYard(lexer('1 + sum(1 + 2, 1 * (sum(1, 2) + 3))'))).toEqual(expected);
  });
});
describe('parseEquation', () => {
  /*
   test('count variables works properly', () => {
    expect(countVariables(shuntingYard(lexer('a + b')) as parser.ASTNode)).toEqual(['a', 'b']);

    expect(countVariables(shuntingYard(lexer('a + b * (1 + 2)^c')) as parser.ASTNode)).toEqual(
      ['a', 'b', 'c']
    );
  });
   */
  test('correctly parses ExplicitRectangulars and evaluates them', () => {
    let eq1 = (parser.parseEquation('z=x*y') as ExplicitRectangularEquation);
    let eq2 = (parser.parseEquation('x=y*z+1') as ExplicitRectangularEquation);
    let eq3 = (parser.parseEquation('y=(x*z+1)^5 - (7 + x)') as ExplicitRectangularEquation)
    let eq4 = (parser.parseEquation('sum(x, y*x/2 + 1)=z') as ExplicitRectangularEquation)
    for (let i = 0; i < 500; i = i + 1) {
      const mt = MersenneTwister19937.seed(1);
      const x = real(0, 10000, true)(mt);
      const y = real(0, 10000, true)(mt);
      expect(eq1.evaluate(x,y)).toEqual(x*y);
      expect(eq2.evaluate(x,y)).toEqual(x*y+1);
      expect(eq3.evaluate(x,y)).toEqual(Math.pow((x*y+1), 5) - (7+x));
      expect(eq4.evaluate(x,y)).toEqual(x+y*x/2+1);
    }
  });
  test('gives correct error for malformed ExplicitRectangulars', () => {
    // undefined var
    expect(() => (parser.parseEquation('z=x*y+a') as ExplicitRectangularEquation).evaluate(2,5)).toThrowErrorMatchingSnapshot();
    // insufficient operands
    expect(parser.parseEquation('z=x*y+') as ExplicitRectangularEquation).toEqual(new Error('insuffiecnt operands'));
    expect(parser.parseEquation('z=sum(x*y)') as ExplicitRectangularEquation).toEqual(new Error('insuffiecnt operands'));
    // not an equation
    expect(parser.parseEquation('x*y') as ExplicitRectangularEquation).toEqual(new Error('Equation does not have two expressions set equal'));
  });
});
