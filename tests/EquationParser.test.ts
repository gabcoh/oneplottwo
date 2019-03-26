
import * as parser from '../src/EquationParser';

const lexer = parser.__PRIVATE__.lexer;
const shuntingYard = parser.__PRIVATE__.shuntingYard;
const ops = parser.__PRIVATE__.operators;
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
      operator: new parser.FunctionOperator('test', 3),
      operands: [1, 2, 3],
    };
    expect(shuntingYard(lexer('test(1, 2, 3)'))).toEqual(expected);
    expected = {
      operator: new parser.FunctionOperator('test', 1),
      operands: [{
        operator: new parser.FunctionOperator('test', 1),
        operands: [1],
      }],
    };
    expect(shuntingYard(lexer('test(test(1))'))).toEqual(expected);

    expected = {
      operator: ops.get('+') as parser.Operator,
      operands: [1, {
        operator: new parser.FunctionOperator('test', 2),
        operands: [{
          operator: ops.get('+') as parser.Operator,
          operands: [1, 2],
        }, {
          operator: ops.get('*') as parser.Operator,
          operands: [1, {
            operator: ops.get('+') as parser.Operator,
            operands: [{
              operator: new parser.FunctionOperator('testb', 2),
              operands: [1, 2],
            }, 3],
          }],
        }],
      }],
    };
    expect(shuntingYard(lexer('1 + test(1 + 2, 1 * (testb(1, 2) + 3))'))).toEqual(expected);
  });
});
