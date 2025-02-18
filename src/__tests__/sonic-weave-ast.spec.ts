import {describe, it, expect} from 'vitest';

import {parse} from '../sonic-weave-ast';

// Debug
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function d(thing: any) {
  console.dir(thing, {depth: null});
}

function parseSingle(source: string) {
  return parse(source).body[0];
}

describe('SonicWeave Abstract Syntax Tree parser', () => {
  it('parses a plain literal (single number)', () => {
    const ast = parse('5;');
    expect(ast).toEqual({
      type: 'Program',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {type: 'IntegerLiteral', value: 5n},
        },
      ],
    });
  });

  it('parses a color literal (single)', () => {
    const ast = parse('#fae;');
    expect(ast).toEqual({
      type: 'Program',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {type: 'ColorLiteral', value: '#fae'},
        },
      ],
    });
  });

  it('parses a colored integer', () => {
    const ast = parse('7; #12ff34;');
    expect(ast).toEqual({
      type: 'Program',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {type: 'IntegerLiteral', value: 7n},
        },
        {
          type: 'ExpressionStatement',
          expression: {type: 'ColorLiteral', value: '#12ff34'},
        },
      ],
    });
  });

  it('rejects a single comma', () => {
    expect(() => parse(',;')).toThrow();
  });

  it('parses kilohertz', () => {
    const ast = parseSingle('1 kHz');
    expect(ast).toEqual({
      type: 'ExpressionStatement',
      expression: {
        type: 'BinaryExpression',
        operator: ' ',
        left: {type: 'IntegerLiteral', value: 1n},
        right: {type: 'HertzLiteral', prefix: 'k'},
        preferLeft: false,
        preferRight: false,
      },
    });
  });

  it('parses hertz with implicit scalar multiplication', () => {
    const ast = parseSingle('420.69 Hz');
    expect(ast).toEqual({
      type: 'ExpressionStatement',
      expression: {
        type: 'BinaryExpression',
        operator: ' ',
        left: {
          type: 'DecimalLiteral',
          whole: 420n,
          fractional: '69',
          exponent: null,
          flavor: '',
        },
        right: {type: 'HertzLiteral', prefix: ''},
        preferLeft: false,
        preferRight: false,
      },
    });
  });

  it('parses exaseconds', () => {
    const ast = parseSingle('420 Es');
    expect(ast).toEqual({
      type: 'ExpressionStatement',
      expression: {
        type: 'BinaryExpression',
        operator: ' ',
        left: {type: 'IntegerLiteral', value: 420n},
        right: {type: 'SecondLiteral', prefix: 'E'},
        preferLeft: false,
        preferRight: false,
      },
    });
  });

  it('parses scientific notation in scalar multipliers', () => {
    const ast = parseSingle('420E69 s');
    expect(ast).toEqual({
      type: 'ExpressionStatement',
      expression: {
        type: 'BinaryExpression',
        operator: ' ',
        left: {
          type: 'DecimalLiteral',
          whole: 420n,
          fractional: '',
          exponent: 69,
          flavor: '',
        },
        right: {type: 'SecondLiteral', prefix: ''},
        preferLeft: false,
        preferRight: false,
      },
    });
  });

  it('parses scientific notation in comma decimals', () => {
    const ast = parseSingle('42,0e-69');
    expect(ast).toEqual({
      type: 'ExpressionStatement',
      expression: {
        type: 'DecimalLiteral',
        whole: 42n,
        fractional: '0',
        exponent: -69,
        flavor: '',
      },
    });
  });

  it('parses scientific notation in dot decimals', () => {
    const ast = parseSingle('42.0e-69');
    expect(ast).toEqual({
      type: 'ExpressionStatement',
      expression: {
        type: 'DecimalLiteral',
        whole: 42n,
        fractional: '0',
        exponent: -69,
        flavor: '',
      },
    });
  });

  it('parses cents with implicit units', () => {
    const ast = parseSingle('1.955');
    expect(ast).toEqual({
      type: 'ExpressionStatement',
      expression: {type: 'CentsLiteral', whole: 1n, fractional: '955'},
    });
  });

  it('parses real decimals over cents', () => {
    const ast = parseSingle('1.955r');
    expect(ast).toEqual({
      type: 'ExpressionStatement',
      expression: {
        type: 'DecimalLiteral',
        whole: 1n,
        fractional: '955',
        exponent: null,
        flavor: 'r',
      },
    });
  });

  it('can treat \\ as an operator', () => {
    const ast = parseSingle('7 \\ twelve');
    expect(ast).toEqual({
      type: 'ExpressionStatement',
      expression: {
        type: 'BinaryExpression',
        operator: '\\',
        left: {type: 'IntegerLiteral', value: 7n},
        right: {type: 'Identifier', id: 'twelve'},
        preferLeft: false,
        preferRight: false,
      },
    });
  });

  it('parses ranges', () => {
    const ast = parseSingle('[1..10]');
    expect(ast).toEqual({
      type: 'ExpressionStatement',
      expression: {
        type: 'Range',
        start: {type: 'IntegerLiteral', value: 1n},
        end: {type: 'IntegerLiteral', value: 10n},
      },
    });
  });

  it('parses a return statement', () => {
    const ast = parse('riff foo{return;}');
    expect(ast).toEqual({
      type: 'Program',
      body: [
        {
          type: 'FunctionDeclaration',
          name: {type: 'Identifier', id: 'foo'},
          parameters: {
            type: 'Parameters',
            identifiers: [],
            rest: null,
          },
          body: [{type: 'ReturnStatement'}],
          text: 'riff foo{return;}',
        },
      ],
    });
  });

  it('parses rest syntax', () => {
    const ast = parse('riff foo bar ...baz {}');
    expect(ast).toEqual({
      type: 'Program',
      body: [
        {
          type: 'FunctionDeclaration',
          name: {type: 'Identifier', id: 'foo'},
          parameters: {
            type: 'Parameters',
            identifiers: [{type: 'Identifier', id: 'bar'}],
            rest: {type: 'Identifier', id: 'baz'},
          },
          body: [],
          text: 'riff foo bar ...baz {}',
        },
      ],
    });
  });

  it('parses spread syntax', () => {
    const ast = parse('[foo, ...bar, baz]');
    expect(ast).toEqual({
      type: 'Program',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'ArrayLiteral',
            elements: [
              {
                type: 'Argument',
                spread: false,
                expression: {type: 'Identifier', id: 'foo'},
              },
              {
                type: 'Argument',
                spread: true,
                expression: {type: 'Identifier', id: 'bar'},
              },
              {
                type: 'Argument',
                spread: false,
                expression: {type: 'Identifier', id: 'baz'},
              },
            ],
          },
        },
      ],
    });
  });

  it('parses coalescing reassignment', () => {
    const ast = parseSingle('x ??= 42');
    expect(ast).toEqual({
      type: 'AssignmentStatement',
      name: {type: 'Identifier', id: 'x'},
      value: {
        type: 'BinaryExpression',
        operator: '??',
        left: {type: 'Identifier', id: 'x'},
        right: {type: 'IntegerLiteral', value: 42n},
        preferLeft: false,
        preferRight: false,
      },
    });
  });

  it('parses iterated array access', () => {
    const ast = parseSingle('x[i]~[2]');
    expect(ast).toEqual({
      type: 'ExpressionStatement',
      expression: {
        type: 'ArrayAccess',
        object: {
          type: 'ArrayAccess',
          object: {type: 'Identifier', id: 'x'},
          nullish: false,
          index: {type: 'Identifier', id: 'i'},
        },
        nullish: true,
        index: {type: 'IntegerLiteral', value: 2n},
      },
    });
  });

  it('parses iterated slice and array access', () => {
    const ast = parseSingle('x[0,2..10][1..2][0]');
    expect(ast).toEqual({
      type: 'ExpressionStatement',
      expression: {
        type: 'ArrayAccess',
        nullish: false,
        object: {
          type: 'ArraySlice',
          object: {
            type: 'ArraySlice',
            object: {type: 'Identifier', id: 'x'},
            start: {type: 'IntegerLiteral', value: 0n},
            second: {type: 'IntegerLiteral', value: 2n},
            end: {type: 'IntegerLiteral', value: 10n},
          },
          start: {type: 'IntegerLiteral', value: 1n},
          second: null,
          end: {type: 'IntegerLiteral', value: 2n},
        },
        index: {type: 'IntegerLiteral', value: 0n},
      },
    });
  });

  it('parses for..of', () => {
    const ast = parse('for (const foo of bar) foo;');
    expect(ast).toEqual({
      type: 'Program',
      body: [
        {
          type: 'ForOfStatement',
          element: {type: 'Identifier', id: 'foo'},
          array: {type: 'Identifier', id: 'bar'},
          body: {
            type: 'ExpressionStatement',
            expression: {type: 'Identifier', id: 'foo'},
          },
          mutable: false,
        },
      ],
    });
  });

  it('parses if..else', () => {
    const ast = parse('if (foo) bar; else baz;');
    expect(ast).toEqual({
      type: 'Program',
      body: [
        {
          type: 'IfStatement',
          test: {type: 'Identifier', id: 'foo'},
          consequent: {
            type: 'ExpressionStatement',
            expression: {type: 'Identifier', id: 'bar'},
          },
          alternate: {
            type: 'ExpressionStatement',
            expression: {type: 'Identifier', id: 'baz'},
          },
        },
      ],
    });
  });

  it('parses double-quoted string literals with escapes', () => {
    const ast = parseSingle('"hello\\nworld"');
    expect(ast).toEqual({
      type: 'ExpressionStatement',
      expression: {type: 'StringLiteral', value: 'hello\nworld'},
    });
  });

  it('parses single-quoted string literals with escapes', () => {
    const ast = parseSingle("'hell\\u0000 world'");
    expect(ast).toEqual({
      type: 'ExpressionStatement',
      expression: {type: 'StringLiteral', value: 'hell\x00 world'},
    });
  });

  it('accepts \\x escapes', () => {
    const ast = parseSingle('"hello w\\x00rld"');
    expect(ast).toEqual({
      type: 'ExpressionStatement',
      expression: {type: 'StringLiteral', value: 'hello w\x00rld'},
    });
  });

  it('parses array element assignment', () => {
    const ast = parseSingle('arr[1] = 2');
    expect(ast).toEqual({
      type: 'AssignmentStatement',
      name: {
        type: 'ArrayAccess',
        object: {type: 'Identifier', id: 'arr'},
        nullish: false,
        index: {type: 'IntegerLiteral', value: 1n},
      },
      value: {type: 'IntegerLiteral', value: 2n},
    });
  });

  it('lets you call functions from arrays', () => {
    const ast = parseSingle('arr[1]()');
    expect(ast).toEqual({
      type: 'ExpressionStatement',
      expression: {
        type: 'CallExpression',
        callee: {
          type: 'ArrayAccess',
          object: {type: 'Identifier', id: 'arr'},
          nullish: false,
          index: {type: 'IntegerLiteral', value: 1n},
        },
        args: [],
      },
    });
  });

  it('lets you call functions from sliced arrays', () => {
    const ast = parseSingle('arr[..][1]()');
    expect(ast).toEqual({
      type: 'ExpressionStatement',
      expression: {
        type: 'CallExpression',
        callee: {
          type: 'ArrayAccess',
          nullish: false,
          object: {
            type: 'ArraySlice',
            object: {type: 'Identifier', id: 'arr'},
            start: null,
            second: null,
            end: null,
          },
          index: {type: 'IntegerLiteral', value: 1n},
        },
        args: [],
      },
    });
  });

  it('parses N-steps-of-M-equal-divisions-of-just-intonation (literal)', () => {
    const ast = parseSingle('(7\\13)<3>');
    expect(ast).toEqual({
      type: 'ExpressionStatement',
      expression: {
        type: 'NedjiProjection',
        octaves: {
          type: 'NedjiLiteral',
          numerator: 7,
          denominator: 13,
          equaveNumerator: null,
          equaveDenominator: null,
        },
        base: {type: 'IntegerLiteral', value: 3n},
      },
    });
  });

  it('parses N-steps-of-equal-divisions-of-just-intonation (binary expression)', () => {
    const ast = parseSingle('n\\m<ji>');
    expect(ast).toEqual({
      type: 'ExpressionStatement',
      expression: {
        type: 'NedjiProjection',
        octaves: {
          type: 'BinaryExpression',
          operator: '\\',
          left: {type: 'Identifier', id: 'n'},
          right: {type: 'Identifier', id: 'm'},
          preferLeft: false,
          preferRight: false,
        },
        base: {type: 'Identifier', id: 'ji'},
      },
    });
  });

  it('prefers augmented fourth over the absolute pitch A4', () => {
    const ast = parseSingle('A4');
    expect(ast.expression.type).toBe('FJS');
  });

  it("has an alternative spelling for the absolute pitch nominal 'A'", () => {
    const ast = parseSingle('a4');
    expect(ast.expression.type).toBe('AbsoluteFJS');
  });

  it('prefers pitch declaration over variable declaration', () => {
    const ast = parseSingle('a4 = 440 Hz');
    expect(ast.type).toBe('PitchDeclaration');
    expect(ast.left.type).toBe('AbsoluteFJS');
  });

  it('is aware of interval qualities (no minor twelfth)', () => {
    const ast = parseSingle('m12');
    expect(ast.expression.type).toBe('Identifier');
  });

  it('differentiates natural accidentals from variable declaration', () => {
    const ast = parseSingle('D=4');
    expect(ast.expression.type).toBe('AbsoluteFJS');
  });

  it("still parses variable declaration when there's no conflict with FJS", () => {
    const ast = parseSingle('d=4');
    expect(ast.type).toBe('AssignmentStatement');
  });

  it('supports unary expressions applied to call expressions', () => {
    const ast = parseSingle('not foo()');
    expect(ast).toEqual({
      type: 'ExpressionStatement',
      expression: {
        type: 'UnaryExpression',
        operator: 'not',
        operand: {
          type: 'CallExpression',
          callee: {type: 'Identifier', id: 'foo'},
          args: [],
        },
        prefix: true,
        uniform: false,
      },
    });
  });

  it('prioritizes unary expression over plain', () => {
    const ast = parseSingle('i--');
    expect(ast).toEqual({
      type: 'ExpressionStatement',
      expression: {
        type: 'UnaryExpression',
        operator: '--',
        operand: {type: 'Identifier', id: 'i'},
        prefix: false,
        uniform: false,
      },
    });
  });

  it('parses a lone comma-decimal', () => {
    const ast = parseSingle('3,14');
    expect(ast).toEqual({
      type: 'ExpressionStatement',
      expression: {
        type: 'DecimalLiteral',
        whole: 3n,
        fractional: '14',
        exponent: null,
        flavor: '',
      },
    });
  });

  it('parses FJS in array literals', () => {
    const ast = parseSingle('[C#4^11_5,7,P5^77_25]');
    expect(ast.expression.elements).toHaveLength(2);
  });

  it('can label and color comma-decimals', () => {
    const ast = parseSingle('1,234 "my third" #0dead0');
    expect(ast).toEqual({
      type: 'ExpressionStatement',
      expression: {
        type: 'LabeledExpression',
        object: {
          type: 'DecimalLiteral',
          whole: 1n,
          fractional: '234',
          exponent: null,
          flavor: '',
        },
        labels: [
          {type: 'StringLiteral', value: 'my third'},
          {type: 'ColorLiteral', value: '#0dead0'},
        ],
      },
    });
  });

  it('can enumerate unary expressions and function calls', () => {
    const ast = parseSingle('root():-2');
    expect(ast).toEqual({
      type: 'ExpressionStatement',
      expression: {
        type: 'EnumeratedChord',
        mirror: false,
        intervals: [
          {
            type: 'CallExpression',
            callee: {type: 'Identifier', id: 'root'},
            args: [],
          },
          {
            type: 'UnaryExpression',
            operator: '-',
            operand: {type: 'IntegerLiteral', value: 2n},
            prefix: true,
            uniform: false,
          },
        ],
      },
    });
  });

  it('rejects numeric labels', () => {
    expect(() => parseSingle('1 2')).toThrow();
  });

  it('accepts array comprehensions spanning multiple rows', () => {
    const ast = parseSingle(`
      [
        foo bar
          for
            foo of baz
          for
            bar of qux
      ]
    `);
    expect(ast).toEqual({
      type: 'ExpressionStatement',
      expression: {
        type: 'ArrayComprehension',
        expression: {
          type: 'LabeledExpression',
          object: {type: 'Identifier', id: 'foo'},
          labels: [{type: 'Identifier', id: 'bar'}],
        },
        comprehensions: [
          {
            element: {type: 'Identifier', id: 'foo'},
            array: {type: 'Identifier', id: 'baz'},
          },
          {
            element: {type: 'Identifier', id: 'bar'},
            array: {type: 'Identifier', id: 'qux'},
          },
        ],
      },
    });
  });

  it('accepts ranges spanning multiple rows', () => {
    const ast = parseSingle('[\n1\n..\n10\n]');
    expect(ast.expression.type).toBe('Range');
  });

  it('accepts step ranges spanning multiple rows', () => {
    const ast = parseSingle('[\n2\n,\n4\n..\n10\n]');
    expect(ast.expression.type).toBe('Range');
  });

  it('accepts array access spanning multiple rows', () => {
    const ast = parseSingle('foo[\nbar\n]');
    expect(ast.expression.type).toBe('ArrayAccess');
  });

  it('accepts array slice spanning multiple rows', () => {
    const ast = parseSingle('foo[\n1\n..\n10\n]');
    expect(ast.expression.type).toBe('ArraySlice');
  });

  it('prioritizes recipropower over lift', () => {
    const ast = parseSingle('3/2^/ 2');
    expect(ast).toEqual({
      type: 'ExpressionStatement',
      expression: {
        type: 'BinaryExpression',
        operator: '^/',
        left: {type: 'FractionLiteral', numerator: 3n, denominator: 2n},
        right: {type: 'IntegerLiteral', value: 2n},
        preferLeft: false,
        preferRight: false,
      },
    });
  });

  it('supports multiple superscripts on FJS', () => {
    const ast = parseSingle('M2^5^7');
    expect(ast.expression.superscripts).toEqual([
      [5, ''],
      [7, ''],
    ]);
  });

  it('supports multiple subcripts on AbsoluteFJS', () => {
    const ast = parseSingle('Fb4_5_5');
    expect(ast.expression.subscripts).toEqual([
      [5, ''],
      [5, ''],
    ]);
  });
});

describe('Automatic semicolon insertion', () => {
  it('works with return statements', () => {
    const ast = parse('return\nreturn');
    expect(ast.body).toHaveLength(2);
  });

  it('works with throw statements', () => {
    const ast = parse('throw "this"\nthrow "that"');
    expect(ast.body).toHaveLength(2);
  });

  it('works with identifiers', () => {
    const ast = parse('foo\nbar');
    expect(ast.body).toHaveLength(2);
  });

  it('works with unary minus', () => {
    const ast = parse('foo\n-bar');
    expect(ast.body).toHaveLength(2);
  });

  it('works with repeated ups', () => {
    const ast = parse('^B4\n^^B4');
    expect(ast.body).toHaveLength(2);
  });

  it('works with nedji projection', () => {
    const ast = parse('(1\\2)<3>\n2\\2<(3)>');
    expect(ast.body).toHaveLength(2);
  });
});
