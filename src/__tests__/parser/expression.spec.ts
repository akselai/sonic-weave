import {describe, it, expect} from 'vitest';
import {evaluateExpression} from '../../parser';
import {Color, Interval, Val} from '../../interval';
import {TimeMonzo} from '../../monzo';

function parseSingle(source: string) {
  const value = evaluateExpression(source, false);
  expect(value).toBeInstanceOf(Interval);
  return value as Interval;
}

describe('SonicWeave expression evaluator', () => {
  it('evaluates a single number', () => {
    const value = parseSingle('3');
    expect(value.value.toBigInteger()).toBe(3n);
  });

  it('adds two nedos with denominator preference', () => {
    const interval = parseSingle('4\\12 + 2\\12');
    expect(interval.toString()).toBe('6\\12');
  });

  it('adds a number to nedo (left preference)', () => {
    const interval = parseSingle('2 ~+ 3\\3');
    expect(interval.toString()).toBe('4');
  });

  it('adds a number to nedo (right preference)', () => {
    const interval = parseSingle('2 +~ 3\\3');
    expect(interval.toString()).toBe('6\\3');
  });

  it('adds a number to nedo (impossible right preference)', () => {
    const interval = parseSingle('1 +~ 3\\3');
    expect(interval.toString()).toBe('1\\1<3>');
  });

  it('accesses variables', () => {
    const interval = parseSingle('TAU');
    // The correct value is actually 6.283185307179586, but it gets mushed a bit along the way.
    expect(interval.toString()).toBe('6.283185307179587r');
  });

  it('evaluates a color', () => {
    const purple = evaluateExpression('#dc12ab', false);
    expect(purple).instanceOf(Color);
    expect((purple as Color).value).toBe('#dc12ab');
  });

  it('adds hertz', () => {
    const interval = parseSingle('69 mHz + 420 Hz + 9 kHz');
    expect(interval.toString()).toBe('9420.069 Hz');
  });

  it('subtracts cents', () => {
    const interval = parseSingle('1.955 - 1c');
    expect(interval.totalCents()).toBeCloseTo(0.955);
  });

  it('supports pythagorean relative notation', () => {
    const sixth = parseSingle('M6');
    expect(sixth.value.toFraction().toFraction()).toBe('27/16');
    expect(sixth.toString()).toBe('M6');
  });

  it('supports neutral intervals', () => {
    const halfFifth = parseSingle('n3');
    expect(halfFifth.value.valueOf()).toBeCloseTo(Math.sqrt(1.5));
  });

  it('supports quarter-augmented intervals', () => {
    const fourthFifth = parseSingle('sM2');
    expect(fourthFifth.value.valueOf()).toBeCloseTo(1.5 ** 0.25);
  });

  it('supports tone-splitter interordinal', () => {
    const splitTone = parseSingle('n1.5');
    expect(splitTone.value.valueOf()).toBeCloseTo(Math.sqrt(9 / 8));
  });

  it('supports semiquartal interordinals', () => {
    const semifourth = parseSingle('m2.5');
    expect(semifourth.value.valueOf()).toBeCloseTo(Math.sqrt(4 / 3));
  });

  it("has mid from ups-and-downs but it's spelled 'n' and mixes with NFJS", () => {
    const undecimalMidFourth = parseSingle('n4^11n');
    expect(undecimalMidFourth.value.toFraction().toFraction()).toBe('11/8');
    const undecimalMidFifth = parseSingle('n5_11n');
    expect(undecimalMidFifth.value.toFraction().toFraction()).toBe('16/11');
  });

  it("doesn't have '~8' like ups-and-downs doesn't", () => {
    expect(() => parseSingle('n8')).toThrow();
  });

  it('parses monzos', () => {
    const monzo = parseSingle('[+7, 11e-1, 1.4>');
    expect(monzo.domain).toBe('logarithmic');
    const pe = monzo.value.primeExponents;
    expect(pe[0].toFraction()).toBe('7');
    expect(pe[1].toFraction()).toBe('11/10');
    expect(pe[2].toFraction()).toBe('7/5');
    expect(monzo.toString()).toBe('[7 11e-1 1.4>');
  });

  it('parses vals', () => {
    const val = evaluateExpression('<5/3 , -1.001e1]', false) as Val;
    expect(val.domain).toBe('cologarithmic');
    const pe = val.value.primeExponents;
    expect(pe[0].toFraction()).toBe('5/3');
    expect(pe[1].toFraction()).toBe('-1001/100');
    expect(val.toString()).toBe('<5/3 -1.001e1]');
  });

  it('has reversed ranges', () => {
    const scale = evaluateExpression('[5, 4..1]', false);
    expect(Array.isArray(scale)).toBe(true);
    expect(scale).toHaveLength(5);
    expect((scale as Interval[]).map(i => i.toString()).join(';')).toBe(
      '5;4;3;2;1'
    );
  });

  it('has a reciprocal cent', () => {
    const one = parseSingle('1c dot €');
    expect(one.toString()).toBe('1');
  });

  it('supports relative FJS', () => {
    const third = parseSingle('M3^5');
    expect(third.value.toFraction().toFraction()).toBe('5/4');
    expect(third.toString()).toBe('M3^5');
  });

  it('supports neutral FJS', () => {
    const sixth = parseSingle('n6_11n');
    expect(sixth.value.toFraction().toFraction()).toBe('18/11');
    expect(sixth.toString()).toBe('n6_11n');
  });

  it('has access to NFJS accidentals on rationals (relative)', () => {
    const flatFifth = parseSingle('P5^121n');
    expect(flatFifth.value.toFraction().toFraction()).toBe('121/81');
  });

  it('has access to NFJS accidentals on rationals (absolute)', () => {
    const flatFifth = parseSingle('G4_11n,11n');
    expect(flatFifth.value.toFraction().toFraction()).toBe('729/484');
  });

  it('can convert time to frequency', () => {
    const freq = parseSingle('absolute(2 ms)');
    expect(freq.value.valueOf()).toBe(500);
  });

  it('parses the cursed tritone', () => {
    const tritone = parseSingle('14E-1');
    expect(tritone.value.toFraction().toFraction()).toBe('7/5');
    expect(tritone.toString()).toBe('14e-1');
  });

  it('parses nedji', () => {
    const darkFifth = parseSingle('7\\5<4/3>');
    const {fractionOfEquave, equave} = darkFifth.value.toEqualTemperament();
    expect(fractionOfEquave.toFraction()).toBe('7/5');
    expect(equave.toFraction()).toBe('4/3');
    expect(darkFifth.toString()).toBe('7\\5<4/3>');
  });

  it('can color and label an interval directly', () => {
    const greenFifth = parseSingle('1.5e0 green "fifth"');
    expect(greenFifth.color?.value).toBe('green');
    expect(greenFifth.label).toBe('fifth');
  });

  it('can format the half eleventh', () => {
    const neutralSixth = parseSingle('P11 % 2');
    expect(neutralSixth.toString()).toBe('n6');
  });

  it('can format the double tone', () => {
    const majorThird = parseSingle('M2 * 2');
    expect(majorThird.toString()).toBe('M3');
  });

  it('can format the half twelfth', () => {
    const majorSixAndAHalfth = parseSingle('P12 % 2');
    expect(majorSixAndAHalfth.toString()).toBe('m6.5');
  });

  it("bails out when there's no Pythagorean to match", () => {
    const thirdFifth = parseSingle('P5 % 3');
    expect(thirdFifth.toString()).toBe('1\\3<3/2>');
  });

  it('can format a decimal', () => {
    const minorThird = parseSingle('1,2');
    expect(minorThird.toString()).toBe('1.2e');
  });

  it('can convert FJS to monzo', () => {
    const monzo = parseSingle('monzo(vm6_5)');
    expect(monzo.toString()).toBe('[3 0 -1>-1\\');
  });

  it('can convert cents to boolean', () => {
    const yes = parseSingle('bool(0.0 red)');
    expect(yes.color?.value).toBe('red');
    expect(yes.toString()).toBe('(true red)');
  });

  it('can convert boolean to cents', () => {
    const zeroCents = parseSingle('cents(true "yes")');
    expect(zeroCents.label).toBe('yes');
    expect(zeroCents.toString()).toBe('(0. "yes")');
  });

  it('converts pi to an integer', () => {
    const three = parseSingle('int(PI)');
    expect(three.toString()).toBe('3');
  });

  it('converts pi to a hard decimal', () => {
    const pi = parseSingle('decimal(PI)');
    expect(pi.toString()).toBe('3.141592653589793r');
  });

  it('converts pi to a soft decimal', () => {
    const pi = parseSingle('decimal(PI, 5)');
    expect(pi.toString()).toBe('3.14159e');
  });

  it('converts pi to a fraction', () => {
    const approximation = parseSingle('fraction(PI)');
    expect(approximation.toString()).toBe('333/106');
  });

  it('converts pi to a radical (outside of prime limit)', () => {
    const approximation = parseSingle('radical(PI)');
    expect(approximation.toString()).toBe('355/113');
  });

  it('converts pi to a radical (within prime limit)', () => {
    const approximation = parseSingle('radical(PI, 10, 1000)');
    expect(approximation.toString()).toBe('306^1/5');
  });

  it('converts pi to soft cents', () => {
    const approximation = parseSingle('cents(PI, 3)');
    expect(approximation.toString()).toBe('1981.795');
  });

  it.each([
    'bool',
    'int',
    'decimal',
    'fraction',
    'radical',
    'cents',
    'FJS',
    'absoluteFJS',
    'monzo',
  ])('has a string representation for variants of %s(pi)', (tier: string) => {
    for (const hz of ['', ' Hz']) {
      for (const conversion of [
        'simplify',
        'relative',
        'absolute',
        'linear',
        'logarithmic',
      ]) {
        const value = parseSingle(
          `A=4 = 440 Hz = 27/16; ${conversion}(${tier}(3.141592653589793r${hz}))`
        );
        const iterated = parseSingle(
          `A=4 = 440 Hz = 27/16; ${value.toString()}`
        );
        expect(iterated.domain).toBe(value.domain);
        expect(iterated.valueOf()).toBeCloseTo(value.valueOf());
      }
    }
  });

  it('can access builtin docs', () => {
    const doc = evaluateExpression('doc(primes)', false);
    expect(doc).toBe(
      'Obtain an array of prime numbers such that start <= p <= end.'
    );
  });

  it('sets implicit 1/1 on pitch declaration', () => {
    const freq = parseSingle('Bb5 = 100 Hz; absolute(2)');
    expect(freq.value.timeExponent.equals(-1)).toBe(true);
    expect(freq.value.valueOf()).toBeCloseTo(200);
  });

  it('has lifts', () => {
    const liftUnison = parseSingle('/P1');
    expect(liftUnison.value.cents).toBe(5);
    expect(liftUnison.totalCents()).toBe(5);
  });

  it('has drops', () => {
    const liftUnison = parseSingle('\\P1');
    expect(liftUnison.value.cents).toBe(-5);
    expect(liftUnison.totalCents()).toBe(-5);
  });

  it('has steps', () => {
    const seven = parseSingle('7\\');
    expect(seven.value.cents).toBe(7);
    expect(seven.totalCents()).toBe(7);
  });

  it('has gcd', () => {
    const six = parseSingle('gcd(30, 84)');
    expect(six.toString()).toBe('6');
  });

  it('has lcm', () => {
    const fourTwenty = parseSingle('lcm(30, 84)');
    expect(fourTwenty.toString()).toBe('420');
  });

  it('has a just intonation point', () => {
    const marvelCents = parseSingle('JIP(225/224)');
    expect(marvelCents.toString()).toBe('7.711522991319271rc');
  });

  it('parses negative intervals correctly', () => {
    const interval = parseSingle('AA-2');
    expect(interval.totalCents()).toBeCloseTo(-431.28);
  });

  it('converts negative intervals correctly', () => {
    const interval = parseSingle('FJS([25 -16>)');
    expect(interval.toString()).toBe('AA-2');
  });

  it('preserves ups and lifts on FJS', () => {
    const str = evaluateExpression('str(/vvM3)', false);
    expect(str).toBe('/vvM3');
  });

  it('preserves ups and lifts on AbsoluteFJS', () => {
    const str = evaluateExpression('str(\\^^E#7)', false);
    expect(str).toBe('\\^^E#7');
  });

  it('has a fancy cent', () => {
    const centisemioctave = parseSingle('1¢');
    expect(centisemioctave.toString()).toBe('1.');
  });

  it('can add FJS', () => {
    const augmentedFifth = parseSingle('M3 + M3');
    expect(augmentedFifth.toString()).toBe('A5');
  });

  it('can mod FJS', () => {
    const majorThird = parseSingle('M17^5 mod P8');
    expect(majorThird.toString()).toBe('M3^5');
  });

  it('can round FJS', () => {
    const doubleOctave = parseSingle('M17^5 to P8');
    expect(doubleOctave.toString()).toBe('P15');
  });

  it('can multiply FJS', () => {
    const majorThird = parseSingle('M2 * 2');
    expect(majorThird.toString()).toBe('M3');
  });

  it('can split FJS', () => {
    const perfectFourth = parseSingle('m7 % 2');
    expect(perfectFourth.toString()).toBe('P4');
  });

  it('can wing sum FJS', () => {
    const eight = parseSingle('P12 ~+~ M17^5');
    expect(eight.toString()).toBe('P22');
  });

  it('can measure the quality of vals', () => {
    const prettyGood = parseSingle('cosJIP(12@5)');
    expect(prettyGood.valueOf()).toBeCloseTo(1, 5);

    const great = parseSingle('cosJIP(53@5)');
    expect(great.valueOf()).toBeCloseTo(1, 7);
  });

  it('can strip colors and labels to get a plain string representation', () => {
    const fifth = evaluateExpression('str(6/4 lime "fifth")', false);
    expect(fifth).toBe('6/4');
  });

  it('can compare absolute to relative', () => {
    const fifth = evaluateExpression('1/1 = 440 Hz; 700 Hz min 3/2', false);
    expect(fifth?.toString()).toBe('3/2');

    const eightHundred = evaluateExpression(
      '1/1 = 440 Hz; 800 Hz max 3/2',
      false
    );
    expect(eightHundred?.toString()).toBe('800 Hz');
  });

  it('produces a cents literal from cent multiplication (integer)', () => {
    const eightyEight = parseSingle('88 c');
    expect(eightyEight?.toString()).toBe('88.');
  });

  it('produces a cents literal from cent multiplication (decimal)', () => {
    const eightyEight = parseSingle('12.03 c');
    expect(eightyEight?.toString()).toBe('12.03');
  });

  it('preserves absolute FJS formatting', () => {
    const phiAt = evaluateExpression('str(phi@4)', false);
    expect(phiAt).toBe('phi@4');
  });

  it('preserves lifts on monzos', () => {
    const liftFifth = parseSingle('/[-1 1>');
    expect(liftFifth?.toString()).toBe('/[-1 1>');
  });

  it('preserves neutral FJS formatting', () => {
    const neutralThird = evaluateExpression('str(n3^11)', false);
    expect(neutralThird).toBe('n3^11');
  });

  it('supports negative indexing on strings', () => {
    const r = evaluateExpression('"bar"[-1]', false);
    expect(r).toBe('r');
  });

  it('supports slices on strings', () => {
    const ba = evaluateExpression('"bar"[..1]', false);
    expect(ba).toBe('ba');
  });

  it('supports indexing on str calls', () => {
    const C = evaluateExpression('str(C4)[0]', false);
    expect(C).toBe('C');
  });

  it('has a lower-case hertz literal', () => {
    const ninety = parseSingle('90hz');
    expect(ninety.isAbsolute()).toBe(true);
    expect(ninety.value.valueOf()).toBeCloseTo(90);
  });

  it('has zepto hertz', () => {
    const smol = parseSingle('1 zhz');
    expect(smol.isAbsolute()).toBe(true);
    expect(smol.value.valueOf()).toBeCloseTo(1e-21);
  });

  it('has hecto hertz', () => {
    const chonk = parseSingle('1hHz');
    expect(chonk.isAbsolute()).toBe(true);
    expect(chonk.value.valueOf()).toBeCloseTo(100);
  });

  it('has exponentiation as a binary operation', () => {
    const nine = parseSingle('3 ^ 2');
    expect(nine.toInteger()).toBe(9);
  });

  it('has inverse exponentiation as a binary operation', () => {
    const three = parseSingle('9 /^ 2');
    expect(three.toInteger()).toBe(3);
  });

  it('has inverse exponentiation as a binary operation (alternative spelling)', () => {
    const three = parseSingle('9 ^/ 2');
    expect(three.toInteger()).toBe(3);
  });

  it('has the logarithm as a binary operation', () => {
    const two = parseSingle('9 /_ 3');
    expect(two.toInteger()).toBe(2);
  });

  it('supports underscores as separators (integer)', () => {
    const million = parseSingle('1_000_000');
    expect(million.toInteger()).toBe(1_000_000);
  });

  it('supports underscores as separators (fraction)', () => {
    const comma = parseSingle('1_000_001/1_000_000');
    expect(comma.toString()).toBe('1000001/1000000');
  });

  it('supports hsl colors', () => {
    const greenish = evaluateExpression('hsl(123, 45, 67)', false) as Color;
    expect(greenish.value).toBe('hsl(123.000, 45.000%, 67.000%)');
    expect(greenish.toString()).toBe('hsl(123.000, 45.000, 67.000)');
    const retry = evaluateExpression(greenish.toString(), false) as Color;
    expect(retry.value).toBe(greenish.value);
  });

  it('supports rgb color labels and reprs', () => {
    const lightFifth = evaluateExpression(
      'repr(3/2 rgb(200, 222, 256))',
      false
    );
    expect(lightFifth).toBe('(3/2 rgb(200.000, 222.000, 256.000))');
  });

  it('can concatenate strings', () => {
    const helloWorld = evaluateExpression(
      'concat("Hello", ",", " ", "World", "!")',
      false
    );
    expect(helloWorld).toBe('Hello, World!');
  });

  it('has spread syntax', () => {
    const stuff = evaluateExpression('["1", ...["2", "3"], "4"]', false);
    expect(stuff).toEqual(['1', ...['2', '3'], '4']);
  });

  it('cannot produce empty ranges', () => {
    const zero = evaluateExpression('[0..0]', false) as Interval[];
    expect(zero).toHaveLength(1);
    expect(zero[0].toInteger()).toBe(0);
  });

  it('can produce empty segments', () => {
    const nothing = evaluateExpression('1::1', false) as Interval[];
    expect(nothing).toHaveLength(0);
  });

  it('interpretes cents as linear decimals in rgba', () => {
    const faded = evaluateExpression(
      'rgba(255, 255, 255, 0.5)',
      false
    ) as Color;
    expect(faded.value).toBe('rgba(255.000, 255.000, 255.000, 0.50000)');
  });

  it('preserves labels based on preference (left)', () => {
    const limeTone = parseSingle('(9 lime) ~rd (2 tomato)');
    expect(limeTone.color?.value).toBe('lime');
  });

  it('preserves labels based on preference (right)', () => {
    const limeTone = parseSingle('(9 lime) rd~ (2 tomato)');
    expect(limeTone.color?.value).toBe('tomato');
  });

  it('resolves labels based on preference (wings)', () => {
    const limeTone = parseSingle('(9 lime) ~rd~ (2 tomato)');
    expect(limeTone.color?.value).toBe('lime');
  });

  it('has infectious labels', () => {
    const redTone = parseSingle('(8 "redtone") % (7 red)');
    expect(redTone.color?.value).toBe('red');
    expect(redTone.label).toBe('redtone');
  });

  it('can simplify formatting', () => {
    const fifth = evaluateExpression('repr(simplify(6/4 plum))', false);
    expect(fifth).toBe('(3/2 plum)');
  });

  it('can bleach away colors', () => {
    const fifth = evaluateExpression('repr(bleach(6/4 plum))', false);
    expect(fifth).toBe('6/4');
  });

  it('has a frequency flavor', () => {
    const nice = parseSingle('69z');
    expect(nice.value.valueOf()).toBeCloseTo(69);
    expect(nice.value.timeExponent.equals(-1));
  });

  it('has array comprehensions', () => {
    const pyth12 = evaluateExpression(
      'map(str, sorted([3^i rdc 2 for i of [-4..7]]))',
      false
    );
    expect(pyth12).toEqual([
      '2187/2048',
      '9/8',
      '32/27',
      '81/64',
      '4/3',
      '729/512',
      '3/2',
      '128/81',
      '27/16',
      '16/9',
      '243/128',
      '2',
    ]);
  });

  it('has ceiling modulo', () => {
    const negativeFour = parseSingle('(-4) modc (-4)');
    expect(negativeFour.toInteger()).toBe(-4);
  });

  it("doesn't let you color pi (variable)", () => {
    const purePi = parseSingle('PI chocolate;PI');
    expect(purePi.color?.value).toBe(undefined);
  });

  it("doesn't let you color pi (scale)", () => {
    const purePi = parseSingle('PI;chocolate;PI');
    expect(purePi.color?.value).toBe(undefined);
  });

  it('can color nedji', () => {
    const blueBP = parseSingle('9\\13<3> blue');
    expect(blueBP.color?.value).toBe('blue');
  });

  // This is somewhat hopeless to fix.
  it.skip('can color nedji projection', () => {
    const blueBP = parseSingle('9\\13<(3)> blue');
    expect(blueBP.color?.value).toBe('blue');
  });

  it('can add vals', () => {
    const yes = parseSingle('24@7 + 5@7 === 29c@7');
    expect(yes.toString()).toBe('true');
  });

  it('knows how to calculate logarithms of negative values', () => {
    const three = parseSingle('(-8) /_ (-2)');
    expect(three.toString()).toBe('3');
  });

  it('knows how to calculate logarithms of negative radicals', () => {
    const three = parseSingle('(-2^3/2) /_ (-2^1/2)');
    expect(three.toString()).toBe('3');
  });

  it('knows how to calculate negative logarithms', () => {
    const minusTwo = parseSingle('1/9 /_ 3');
    expect(minusTwo.toString()).toBe('-2');
  });

  it('has an accurate rdc', () => {
    const thirtyOne = parseSingle('29791 rdc 31');
    expect(thirtyOne.toString()).toBe('31');
  });

  it('can calculate log pi base two', () => {
    const logPi = parseSingle('PI /_ 2');
    expect(logPi.toString()).toBe('1.6514961294723187r');
  });

  it('can calculate log 2 base pi', () => {
    const logPi = parseSingle('2 /_ PI');
    expect(logPi.toString()).toBe('0.6055115613982802r');
  });

  it('calculates geometric absolute value', () => {
    const six = parseSingle('abs(logarithmic(-1/6))');
    expect(six.toString()).toBe('1\\1<6>');
  });

  it('can put variables into arrays', () => {
    const foobar = evaluateExpression(
      'const foo = "foo"; const bar = "bar"; [foo, bar]',
      false
    );
    expect(foobar).toEqual(['foo', 'bar']);
  });

  it('reduces 6 by 3', () => {
    const two = parseSingle('6 rdc 3');
    expect(two.toString()).toBe('2');
  });

  it('calculates tenney height of 5/3', () => {
    const value = parseSingle('tenneyHeight(5/3)');
    expect(value.valueOf()).toBeCloseTo(2.70805);
  });

  it('supports nullish array access', () => {
    const nothing = evaluateExpression('[1, 2, 3]~[4]', false);
    expect(nothing).toBeUndefined();
  });

  it('clears colors using niente', () => {
    const myFifth = parseSingle('1,5 lime "my fifth" niente');
    expect(myFifth.color).toBeUndefined;
    expect(myFifth.label).toBe('my fifth');
  });

  it('supports fraction formatting preference (numerator)', () => {
    const fifth = parseSingle('fraction(1.5e, 6)');
    expect(fifth.toString()).toBe('6/4');
  });

  it('supports fraction formatting preference (denominator)', () => {
    const fifth = parseSingle('fraction(1.5e, 0, 6)');
    expect(fifth.toString()).toBe('9/6');
  });

  it('supports nedji formatting preference', () => {
    const third = parseSingle('nedji(1\\3, 0, 12)');
    expect(third.toString()).toBe('4\\12');
  });

  it('can use "s" as a handy inflection', () => {
    const third = parseSingle('const s = logarithmic(81/80);M3-s');
    expect(third.value.toFraction().toFraction()).toBe('5/4');
  });

  it('can repeat strings', () => {
    const batperson = evaluateExpression('arrayRepeat(5, "na")', false);
    expect(batperson).toBe('nanananana');
  });

  it('can repeat arrays', () => {
    const stuff = evaluateExpression(
      '1;2;3;arrayRepeat(3)',
      false
    ) as Interval[];
    expect(stuff.map(i => i.toString()).join(';')).toBe('1;2;3;1;2;3;1;2;3');
  });

  it('has harmonic addition', () => {
    const value = parseSingle('3/2 /+ 5/3');
    expect(value.toString()).toBe('15/19');
  });

  it('has harmonic subtraction', () => {
    const value = parseSingle('15/19 /- 5/3');
    expect(value.toString()).toBe('3/2');
  });

  it('has something better left unnamed', () => {
    const ghost = parseSingle('P5 /+ M3^5');
    expect(ghost.toString()).toBe('1\\11<6075/512>');
  });

  it('has something even stranger', () => {
    const third = parseSingle('1\\11<6075/512> /- P5');
    expect(third.toString()).toBe('1\\1<5/4>');
  });

  it('has flat multiple array comprehensions', () => {
    const uncutDiamond = evaluateExpression(
      '[str(p % q) for p of [1..5] for q of [1..5]]',
      false
    );
    expect(uncutDiamond).toEqual([
      '1/1',
      '1/2',
      '1/3',
      '1/4',
      '1/5',
      '2/1',
      '2/2',
      '2/3',
      '2/4',
      '2/5',
      '3/1',
      '3/2',
      '3/3',
      '3/4',
      '3/5',
      '4/1',
      '4/2',
      '4/3',
      '4/4',
      '4/5',
      '5/1',
      '5/2',
      '5/3',
      '5/4',
      '5/5',
    ]);
  });

  it('produces cents from addition', () => {
    const nineHundred = parseSingle('894.9 + 5.1');
    expect(nineHundred.toString()).toBe('900.');
  });

  it('produces cents from subtraction', () => {
    const nineHundred = parseSingle('905.1 - 5.1');
    expect(nineHundred.toString()).toBe('900.');
  });

  it('has explicit subgroups for monzos', () => {
    const semifourth = parseSingle('[0, 1, -1>@2.3.13/5');
    expect(semifourth.toString()).toBe('[0 1 -1>@2.3.13/5');
    expect(semifourth.value.toFraction().toFraction()).toBe('15/13');
  });

  it('has explicit subgroups for vals', () => {
    const fiveGPV = evaluateExpression('<5, 8, 7]@2.3.13/5', false) as Val;
    expect(fiveGPV.toString()).toBe('<5 8 7]@2.3.13/5');
    expect(fiveGPV.value.primeExponents.map(pe => pe.toFraction())).toEqual([
      '5',
      '8',
      '-7/2',
      '0',
      '0',
      '7/2',
    ]);
    expect(
      fiveGPV.value.dot(TimeMonzo.fromFraction('15/13')).toFraction()
    ).toBe('1');
  });

  it('has trivial tensoring', () => {
    const fifteen = parseSingle('3 tns 5');
    expect(fifteen.toString()).toBe('15');
  });

  it('has rank-1 tensoring (left)', () => {
    const doubles = evaluateExpression('2 tns [3, 5]', false) as Interval[];
    expect(doubles.map(i => i.toString())).toEqual(['6', '10']);
  });

  it('has rank-1 tensoring (right)', () => {
    const fives = evaluateExpression('[2, 3] tns 5', false) as Interval[];
    expect(fives.map(i => i.toString())).toEqual(['10', '15']);
  });

  it('has rank-3 tensoring', () => {
    const block = evaluateExpression(
      '([1/1, 3/2]⊗[5/4, 2/1])⊗[7/4, 2/1]',
      false
    ) as unknown as Interval[][][];
    expect(
      block.map(mat => mat.map(row => row.map(i => i.toString())))
    ).toEqual([
      [
        ['35/16', '5/2'],
        ['7/2', '4'],
      ],
      [
        ['105/32', '15/4'],
        ['21/4', '6'],
      ],
    ]);
  });

  it('crashes with zero enumeration', () => {
    expect(() => evaluateExpression('0:1:2:3', false)).toThrow();
  });

  it('has vector negation', () => {
    const vec = evaluateExpression('-[1, -2, 3]', false) as Interval[];
    expect(vec.map(i => i.toString())).toEqual(['-1', '2', '-3']);
  });

  it('has vector addition', () => {
    const vec = evaluateExpression(
      '[1, 2, 3] + [10, 20, 300]',
      false
    ) as Interval[];
    expect(vec.map(i => i.toString())).toEqual(['11', '22', '303']);
  });

  it('has quick(ish) edo subset', () => {
    const ionian = evaluateExpression(
      '[2, 4, 5, 7, 9, 11, 12] \\ 12',
      false
    ) as Interval[];
    expect(ionian.map(i => i.toString())).toEqual([
      '2\\12',
      '4\\12',
      '5\\12',
      '7\\12',
      '9\\12',
      '11\\12',
      '12\\12',
    ]);
  });

  it('has quick nedji subset', () => {
    const scale = evaluateExpression('[1, 2, 5] \\ 13<3>', false) as Interval[];
    expect(scale.map(i => i.toString())).toEqual([
      '1\\13<3>',
      '2\\13<3>',
      '5\\13<3>',
    ]);
  });

  it('parses binary nedo over a step literal (identifier)', () => {
    const tritone = parseSingle('const two = 2;1\\two');
    expect(tritone.toString()).toBe('1\\2');
  });

  it('parses binary nedo over a step literal (call)', () => {
    const tritone = parseSingle('1\\trunc(2.2e)');
    expect(tritone.toString()).toBe('1\\2');
  });

  it('formats non-standard simplified vals', () => {
    const orphanBohlenPierce = evaluateExpression('simplify(b13@)') as Val;
    expect(orphanBohlenPierce.toString()).toBe(
      'withEquave(<8 13 19 23 28 30 34 35 37], 3)'
    );
  });

  it('parses non-standard vals', () => {
    const orphanBohlenPierce = evaluateExpression(
      'withEquave(<8 13 19 23], 3)'
    ) as Val;
    expect(orphanBohlenPierce.equave.toString()).toBe('3');
    expect(
      orphanBohlenPierce.value.primeExponents.map(pe => pe.toFraction())
    ).toEqual(['8', '13', '19', '23']);
  });

  it('has square superparticulars', () => {
    const archy = parseSingle('S8');
    expect(archy.domain).toBe('logarithmic');
    expect(archy.value.toFraction().toFraction()).toBe('64/63');
  });

  it('does S-expressions in the logarithmic domain', () => {
    const syntonic = parseSingle('S6-S8');
    expect(syntonic.domain).toBe('logarithmic');
    expect(syntonic.value.toFraction().toFraction()).toBe('81/80');
  });

  it('can use square superparticulars as inflections', () => {
    const n2 = parseSingle('M2-S9..11');
    expect(n2.domain).toBe('logarithmic');
    expect(n2.value.toFraction().toFraction()).toBe('12/11');
  });

  it('evaluates S2..16 correctly', () => {
    expect(evaluateExpression('str(linear(S2..16))', false)).toBe('32/17');
  });

  it('evaluates S11..37 correctly', () => {
    expect(evaluateExpression('str(linear(S11..37))', false)).toBe('407/380');
  });

  it('has Helmholtz-Ellis 2020 comma flavors', () => {
    const h17 = parseSingle('A1_17h');
    expect(h17.value.toFraction().toFraction()).toBe('17/16');
  });

  it("has richie's HEJI extension", () => {
    const h71 = parseSingle('M2_71h');
    expect(h71.value.toFraction().toFraction()).toBe('71/64');
  });

  it('has wolf-monzo variant', () => {
    const h17 = parseSingle('M2_17m');
    expect(h17.value.toFraction().toFraction()).toBe('17/16');
  });

  it("has Lumi's bridging commas (island)", () => {
    const semifourth = parseSingle('C4 = 1/1;φ4_3l');
    expect(semifourth.value.toFraction().toFraction()).toBe('15/13');
  });

  it("has Lumi's bridging commas (memes)", () => {
    const ohno = parseSingle('sm2^0l');
    expect(ohno.value.toFraction().toFraction()).toBe('15/14');
  });

  it('has syntonic rastmic subchroma notation (relative artodemisharp)', () => {
    const artodemi = parseSingle('sA1_1s');
    expect(artodemi.value.toFraction().toFraction()).toBe('33/32');
  });

  it('has syntonic rastmic subchroma notation (absolute tendodemisharp)', () => {
    const artodemi = parseSingle('C4 = 1/1;Ct4^1s');
    expect(artodemi.value.toFraction().toFraction()).toBe('729/704');
  });

  it('has syntonic rastmic subchroma notation (relative sesquiraflat)', () => {
    const srf = parseSingle('P1_12s');
    const monzo = srf.value.primeExponents;
    expect(monzo[0].equals('3/2')).toBe(true);
    expect(monzo[1].equals('-15/2')).toBe(true);
    expect(monzo[2].equals('0')).toBe(true);
    expect(monzo[3].equals('0')).toBe(true);
    expect(monzo[4].equals('3')).toBe(true);
  });

  it('can convert just intonation to HEWM53', () => {
    const M2 = parseSingle('FJS(19/16, "m")');
    expect(M2.toString()).toBe('M2^19m');
    expect(M2.value.toFraction().toFraction()).toBe('19/16');
  });

  it('can parenthesize nedo denominator', () => {
    const almostOctave = parseSingle('1\\ (13/12)');
    expect(almostOctave.value.primeExponents[0].toFraction()).toBe('12/13');
  });

  it("doesn't let you call step literals", () => {
    expect(() => parseSingle('(1\\)(13/12)')).toThrow('Invalid callee.');
  });

  it('can detect echelons (relative)', () => {
    const yes = evaluateExpression('str(isRelative(3/2))', false);
    expect(yes).toBe('true');
  });

  it('can detect echelons (absolute)', () => {
    const no = evaluateExpression('str(isAbsolute(3/2))', false);
    expect(no).toBe('false');
  });

  it('has a representation for a harmonic segment in FJS', () => {
    for (let i = 49; i <= 96; ++i) {
      const fjs = parseSingle(`FJS(${i}/48)`);
      expect(fjs.valueOf()).toBeGreaterThan(1);
      expect(fjs.valueOf()).toBeLessThanOrEqual(2);
      const retry = parseSingle(fjs.toString());
      expect(fjs.equals(retry)).toBe(true);
    }
  });

  it('has a representation for a harmonic segment in FJS using HEWM53 flavors', () => {
    for (let i = 30; i <= 58; ++i) {
      const hewm = parseSingle(`FJS(${i}/29, 'm')`);
      expect(hewm.valueOf()).toBeGreaterThan(1);
      expect(hewm.valueOf()).toBeLessThanOrEqual(2);
      const retry = parseSingle(hewm.toString());
      expect(hewm.equals(retry)).toBe(true);
    }
  });

  it("has a 'mu fourth' and an 'ex fifth' using Lumi's commas", () => {
    const µ4 = parseSingle('n4_2l');
    expect(µ4.value.toFraction().toFraction()).toBe('4/3');
    const x5 = parseSingle('n5^2l');
    expect(x5.value.toFraction().toFraction()).toBe('3/2');
  });

  it('has unicode dot product between vals and intervals', () => {
    const plenty = evaluateExpression('str(P8·€)', false);
    expect(plenty).toBe('1200');
  });

  it('has nested destructuring in array comprehensions', () => {
    const sums = evaluateExpression(
      '[str(foo + bar + baz) for [foo [bar baz]] of [[1, [2, 3]], [4, [5, 6]]]]',
      false
    );
    expect(sums).toEqual(['6', '15']);
  });

  it("has FloraC's flavor for FJS", () => {
    const unison = parseSingle('P1^11f_31f');
    expect(unison.value.toFraction().toFraction()).toBe('33/31');
  });

  it('has classic FJS flavor available', () => {
    const unison = parseSingle('P1^11c_31c');
    expect(unison.value.toFraction().toFraction()).toBe('8019/7936');
  });

  it("can do FJS conversion to with FloraC's flavors", () => {
    const thing = parseSingle('FJS(157/128, "f")');
    expect(thing.toString()).toBe('M3^157f');
  });

  it('switches domains while converting JI to cents', () => {
    const octave = parseSingle('cents(2)');
    expect(octave.totalCents()).toBeCloseTo(1200);
    expect(octave.domain).toBe('logarithmic');
  });

  it('switched domains while converting cents to decimals', () => {
    const octave = parseSingle('decimal(1200.)');
    expect(octave.value.valueOf()).toBeCloseTo(2);
    expect(octave.domain).toBe('linear');
  });

  it('evaluates the difference in absolute FJS as relative FJS (default)', () => {
    const M2 = evaluateExpression('str(E4 - D4)', false);
    expect(M2).toBe('M2');
  });

  it('evaluates the difference in absolute FJS as relative FJS (relative reference)', () => {
    const m2 = evaluateExpression('B3 = 1/1; str(F4 - E4)', false);
    expect(m2).toBe('m2');
  });

  it('evaluates the difference in absolute FJS as relative FJS (absolute reference)', () => {
    const P5 = evaluateExpression('F#5 = 555Hz; str(G3 - C3)', false);
    expect(P5).toBe('P5');
  });

  it('evaluates the difference in absolute FJS as relative FJS (non-standard reference)', () => {
    const P5 = evaluateExpression('F#5 = 5ms; str(G3 - C3)', false);
    expect(P5).toBe('P5');
  });

  it('evaluates the difference in absolute FJS as relative FJS (non-standard reference)', () => {
    const P5 = evaluateExpression('F#5 = (1s)^5/2; str(G3 - C3)', false);
    expect(P5).toBe('P5');
  });

  it('has C5 an octave above C4 even with non-standard reference', () => {
    const C4 = parseSingle('C4 = 10ms; relative(C5)');
    expect(C4.toString()).toBe('1\\1');
  });

  it('has not-a-number', () => {
    const nan = parseSingle('NaN');
    expect(nan.valueOf()).toBeNaN();
    expect(nan.toString()).toBe('NaN');
  });

  it('has negative infinity', () => {
    const inf = parseSingle('-Infinity');
    expect(inf.value.cents).toBe(Infinity);
    expect(inf.value.residual.s).toBe(-1);
    expect(inf.toString()).toBe('-Infinity');
  });

  it('has root half', () => {
    const half = parseSingle('SQRT1_2 ^ 2');
    expect(half.toString()).toBe('1/2');
  });

  it('has sine', () => {
    const sinRad = parseSingle('sin(1)');
    expect(sinRad.toString()).toBe('0.8414709848078965r');
  });

  it('produces nan from asin', () => {
    const wishIwasAcomplexNumber = parseSingle('asin(2)');
    expect(wishIwasAcomplexNumber.toString()).toBe('NaN');
  });
});
