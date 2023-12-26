import {
  Fraction,
  kCombinations,
  mmod,
  isPrime,
  primes,
  approximateRadical,
} from 'xen-dev-utils';
import {Color, Interval, timeMonzoAs} from './interval';
import {TimeMonzo} from './monzo';
import {type ExpressionVisitor, type StatementVisitor} from './parser';
import {MosOptions, mos} from 'moment-of-symmetry';
import {asAbsoluteFJS, asFJS} from './fjs';
import {inspect} from 'node:util';

// Runtime

export type SonicWeaveValue =
  | Function
  | Interval
  | Interval[]
  | Color
  | string
  | undefined;

const ZERO = new Fraction(0);
const ZERO_MONZO = new TimeMonzo(ZERO, [], ZERO);
const ONE_MONZO = new TimeMonzo(ZERO, []);

export function sonicTruth(test: SonicWeaveValue) {
  if (test instanceof Interval) {
    return Boolean(test.value.residual.n);
  } else if (Array.isArray(test)) {
    return Boolean(test.length);
  }
  return Boolean(test);
}

export function sonicBool(b: boolean) {
  return b
    ? new Interval(ONE_MONZO, 'linear', {type: 'TrueLiteral'})
    : new Interval(ZERO_MONZO, 'linear', {type: 'FalseLiteral'});
}

export function linearOne() {
  return new Interval(ONE_MONZO, 'linear', {type: 'IntegerLiteral', value: 1n});
}

// === Library ===

// == Constants
const E = new Interval(TimeMonzo.fromValue(Math.E), 'linear');
const PI = new Interval(TimeMonzo.fromValue(Math.PI), 'linear');
const TAU = new Interval(TimeMonzo.fromValue(2 * Math.PI), 'linear');

// == Second-party wrappers ==
function isPrime_(n: Interval) {
  return sonicBool(isPrime(n.valueOf()));
}

function primes_(start: Interval, end?: Interval) {
  return primes(start.valueOf(), end ? end.valueOf() : undefined).map(p =>
    Interval.fromInteger(p)
  );
}

function mosSubset(
  numberOfLargeSteps: Interval,
  numberOfSmallSteps: Interval,
  sizeOfLargeStep?: Interval,
  sizeOfSmallStep?: Interval,
  up?: Interval,
  down?: Interval
) {
  const options: MosOptions = {};
  if (sizeOfLargeStep !== undefined) {
    options.sizeOfLargeStep = sizeOfLargeStep.toInteger();
  }
  if (sizeOfSmallStep !== undefined) {
    options.sizeOfSmallStep = sizeOfSmallStep.toInteger();
  }
  if (up !== undefined) {
    options.up = up.toInteger();
  }
  if (down !== undefined) {
    options.down = down.toInteger();
  }
  const result = mos(
    numberOfLargeSteps.toInteger(),
    numberOfSmallSteps.toInteger(),
    options
  );
  return result.map(s => Interval.fromInteger(s));
}

// == Domain conversion ==

// Get rid of formatting.
function simplify(interval: Interval) {
  return new Interval(
    interval.value.clone(),
    interval.domain,
    undefined,
    interval
  );
}

function linear(interval: Interval) {
  return new Interval(interval.value.clone(), 'linear', undefined, interval);
}

function logarithmic(interval: Interval) {
  return new Interval(
    interval.value.clone(),
    'logarithmic',
    undefined,
    interval
  );
}

function cologarithmic(interval: Interval) {
  return new Interval(
    interval.value.clone(),
    'cologarithmic',
    undefined,
    interval
  );
}

export function ablin(
  this: ExpressionVisitor | StatementVisitor,
  interval: Interval
) {
  if (interval.isAbsolute()) {
    const te = interval.value.timeExponent;
    return new Interval(
      interval.value.pow(te.inverse().neg()),
      'linear',
      undefined,
      interval
    );
  }
  if (this.rootContext.unisonFrequency === undefined) {
    throw new Error(
      'Reference frequency must be set for relative -> absolute conversion. Try 1/1 = 440 Hz'
    );
  }
  return new Interval(
    interval.value.mul(this.rootContext.unisonFrequency),
    'linear',
    undefined,
    interval
  );
}

export function relin(
  this: ExpressionVisitor | StatementVisitor,
  interval: Interval
) {
  if (interval.isRelative()) {
    return new Interval(interval.value.clone(), 'linear', undefined, interval);
  }
  if (this.rootContext.unisonFrequency === undefined) {
    throw new Error(
      'Reference frequency must be set for absolute -> relative conversion. Try 1/1 = 440 Hz'
    );
  }
  const absoluteLinear = ablin.bind(this)(interval);
  return new Interval(
    absoluteLinear.value.div(this.rootContext.unisonFrequency),
    'linear',
    undefined,
    interval
  );
}

export function ablog(
  this: ExpressionVisitor | StatementVisitor,
  interval: Interval
) {
  const converted = ablin.bind(this)(interval);
  converted.domain = 'logarithmic';
  return converted;
}

export function relog(
  this: ExpressionVisitor | StatementVisitor,
  interval: Interval
) {
  const converted = relin.bind(this)(interval);
  converted.domain = 'logarithmic';
  return converted;
}

// == Type conversion ==

function bool(this: ExpressionVisitor, interval: Interval) {
  const b = sonicBool(sonicTruth(relin.bind(this)(interval)));
  b.color = interval.color;
  b.label = interval.label;
  return b;
}

function decimal(
  this: ExpressionVisitor,
  interval: Interval,
  fractionDigits?: Interval
) {
  const converted = relin.bind(this)(interval);
  if (fractionDigits !== undefined) {
    const denominator = 10 ** fractionDigits.toInteger();
    const numerator = Math.round(converted.value.valueOf() * denominator);
    converted.value = TimeMonzo.fromFraction(
      new Fraction(numerator, denominator)
    );
  }
  converted.node = converted.value.asDecimalLiteral();
  return converted;
}

function fraction(
  this: ExpressionVisitor,
  interval: Interval,
  epsilon?: Interval
) {
  const converted = relin.bind(this)(interval);
  let eps = 1e-4;
  if (epsilon === undefined) {
    if (converted.value.isFractional()) {
      return new Interval(
        converted.value,
        'linear',
        converted.value.asFractionLiteral(),
        interval
      );
    }
  } else {
    eps = epsilon.value.valueOf();
  }
  const frac = new Fraction(converted.value.valueOf()).simplify(eps);
  const value = TimeMonzo.fromFraction(frac);
  return new Interval(value, 'linear', value.asFractionLiteral(), interval);
}

function radical(
  this: ExpressionVisitor,
  interval: Interval,
  maxIndex: Interval,
  maxHeight: Interval
) {
  const converted = relin.bind(this)(interval);
  if (converted.value.isEqualTemperament()) {
    return new Interval(
      converted.value,
      'linear',
      converted.value.asRadicalLiteral(),
      interval
    );
  }
  const {index, radicant} = approximateRadical(
    converted.value.valueOf(),
    maxIndex === undefined ? undefined : maxHeight.toInteger(),
    maxHeight === undefined ? undefined : maxHeight.toInteger()
  );
  const value = TimeMonzo.fromFraction(radicant).pow(
    new Fraction(index).inverse()
  );
  const node = value.asRadicalLiteral();
  if (node !== undefined) {
    return new Interval(value, 'linear', node, interval);
  } else {
    const frac = approximateRadical(
      converted.value.valueOf(),
      1,
      maxHeight === undefined ? undefined : maxHeight.toInteger()
    ).radicant;
    const rational = TimeMonzo.fromFraction(frac);
    return new Interval(
      rational,
      'linear',
      rational.asFractionLiteral(),
      interval
    );
  }
}

export function cents(
  this: ExpressionVisitor,
  interval: Interval,
  fractionDigits?: Interval
) {
  const converted = relog.bind(this)(interval);
  if (fractionDigits !== undefined) {
    const denominator = 10 ** fractionDigits.toInteger();
    const numerator = Math.round(converted.value.totalCents() * denominator);
    converted.value = new TimeMonzo(ZERO, [
      new Fraction(numerator, denominator * 1200),
    ]);
  }
  converted.node = converted.value.asCentsLiteral();
  return converted;
}

function absoluteFJS(this: ExpressionVisitor, interval: Interval) {
  const C4 = this.rootContext.C4;
  let monzo: TimeMonzo;
  if (C4.timeExponent.n === 0) {
    monzo = relog.bind(this)(interval).value;
  } else {
    monzo = ablog.bind(this)(interval).value;
  }
  let relativeToC4 = monzo.div(C4);
  const node = asAbsoluteFJS(relativeToC4);
  if (node) {
    return new Interval(monzo, 'logarithmic', node, interval);
  }
  relativeToC4 = relativeToC4.approximateSimple();
  return new Interval(
    C4.mul(relativeToC4),
    'logarithmic',
    asAbsoluteFJS(relativeToC4),
    interval
  );
}

function FJS(this: ExpressionVisitor, interval: Interval) {
  const monzo = relog.bind(this)(interval).value;
  const node = asFJS(monzo);
  if (node) {
    return new Interval(monzo, 'logarithmic', node, interval);
  }
  const approximation = monzo.approximateSimple();
  return new Interval(
    approximation,
    'logarithmic',
    asFJS(approximation),
    interval
  );
}

function toMonzo(this: ExpressionVisitor, interval: Interval) {
  const monzo = relog.bind(this)(interval).value;
  monzo.cents = Math.round(monzo.cents);
  monzo.residual = new Fraction(1);
  const node = monzo.asMonzoLiteral();
  return new Interval(monzo, 'logarithmic', node, interval);
}

// == Other ==

function hasConstantStructure(this: ExpressionVisitor, scale?: Interval[]) {
  scale ??= this.context.get('$') as Interval[];
  if (scale.length < 1) {
    return sonicBool(false);
  }
  const rl = relin.bind(this);
  const monzos = scale.map(i => rl(i).value);
  const equave = monzos.pop()!;
  monzos.unshift(equave.pow(0));
  const subtensions: [TimeMonzo, number][] = [];
  for (let i = 0; i < monzos.length; ++i) {
    for (let j = 0; j < monzos.length; ++j) {
      let width = monzos[mmod(i + j, monzos.length)].div(monzos[i]);
      if (i + j >= monzos.length) {
        width = width.mul(equave);
      }
      let unique = true;
      for (const [existing, subtension] of subtensions) {
        if (width.strictEquals(existing)) {
          if (subtension !== j) {
            return sonicBool(false);
          }
          unique = false;
        }
      }
      if (unique) {
        subtensions.push([width, j]);
      }
    }
  }
  return sonicBool(true);
}

function slice(str: string, indexStart: number, indexEnd?: number) {
  return str.slice(indexStart, indexEnd);
}

function upsAs(comma: Interval) {
  const inflection = comma.value;
  function upRigger(interval: Interval) {
    const ups = Math.round(interval.value.cents);
    const value = interval.value.mul(inflection.pow(ups));
    value.cents = 0;
    return new Interval(
      value,
      interval.domain,
      timeMonzoAs(value, interval.node)
    );
  }
  return upRigger;
}

function zip(...args: any[][]) {
  const minLength = Math.min(...args.map(a => a.length));
  const result: any[][] = [];
  for (let i = 0; i < minLength; ++i) {
    result.push(args.map(a => a[i]));
  }
  return result;
}

function zipLongest(...args: any[][]) {
  const maxLength = Math.max(...args.map(a => a.length));
  const result: any[][] = [];
  for (let i = 0; i < maxLength; ++i) {
    result.push(args.map(a => a[i]));
  }
  return result;
}

function random() {
  const value = TimeMonzo.fromValue(Math.random());
  return new Interval(value, 'linear');
}

function randomCents() {
  const value = TimeMonzo.fromCents(Math.random());
  return new Interval(value, 'logarithmic');
}

function floor(this: ExpressionVisitor, value: Interval) {
  value = relin.bind(this)(value);
  const n = Math.floor(value.value.valueOf());
  return Interval.fromInteger(n, value);
}

function round(this: ExpressionVisitor, value: Interval) {
  value = relin.bind(this)(value);
  const n = Math.round(value.value.valueOf());
  return Interval.fromInteger(n, value);
}

function trunc(this: ExpressionVisitor, value: Interval) {
  value = relin.bind(this)(value);
  const n = Math.trunc(value.value.valueOf());
  return Interval.fromInteger(n, value);
}

function ceil(this: ExpressionVisitor, value: Interval) {
  value = relin.bind(this)(value);
  const n = Math.ceil(value.value.valueOf());
  return Interval.fromInteger(n, value);
}

function abs(value: Interval) {
  return value.abs();
}

function min(...args: Interval[]) {
  return args.slice(1).reduce((a, b) => (a.compare(b) <= 0 ? a : b), args[0]);
}

function max(...args: Interval[]) {
  return args.slice(1).reduce((a, b) => (a.compare(b) >= 0 ? a : b), args[0]);
}

function sort(this: ExpressionVisitor, scale?: Interval[]) {
  scale ??= this.context.get('$') as Interval[];
  scale.sort((a, b) => a.compare(b));
}

function reverse(this: ExpressionVisitor, scale?: Interval[]) {
  scale ??= this.context.get('$') as Interval[];
  scale.reverse();
}

function pop(this: ExpressionVisitor, scale?: Interval[]) {
  scale ??= this.context.get('$') as Interval[];
  if (!scale.length) {
    throw new Error('Pop from an empty scale');
  }
  return scale.pop()!;
}

function push(this: ExpressionVisitor, interval: Interval, scale?: Interval[]) {
  scale ??= this.context.get('$') as Interval[];
  scale.push(interval);
}

function shift(this: ExpressionVisitor, scale?: Interval[]) {
  scale ??= this.context.get('$') as Interval[];
  if (!scale.length) {
    throw new Error('Shift from an empty scale');
  }
  return scale.shift()!;
}

function unshift(
  this: ExpressionVisitor,
  interval: Interval,
  scale?: Interval[]
) {
  scale ??= this.context.get('$') as Interval[];
  scale.unshift(interval);
}

function length(this: ExpressionVisitor, scale?: Interval[]) {
  scale ??= this.context.get('$') as Interval[];
  return Interval.fromInteger(scale.length);
}

// TODO: Store function signature in mapper.length and avoid integer conversion when possible.
function map(
  this: ExpressionVisitor,
  mapper: (value: any, index: Interval, array: any[]) => unknown,
  array?: any[]
) {
  mapper = mapper.bind(this);
  array ??= this.context.get('$') as Interval[];
  return array.map((value, index, arr) =>
    mapper(value, Interval.fromInteger(index), arr)
  );
}

function remap(
  this: ExpressionVisitor,
  mapper: (value: any, index: Interval, array: any[]) => unknown,
  array?: any[]
) {
  array ??= this.context.get('$') as Interval[];
  const mapped = map.bind(this)(mapper, array);
  array.length = 0;
  array.push(...mapped);
}

function filter(
  this: ExpressionVisitor,
  tester: (value: any, index: Interval, array: any[]) => SonicWeaveValue,
  array?: any[]
) {
  tester = tester.bind(this);
  array ??= this.context.get('$') as Interval[];
  return array.filter((value, index, arr) =>
    sonicTruth(tester(value, Interval.fromInteger(index), arr))
  );
}

function distill(
  this: ExpressionVisitor,
  tester: (value: any, index: Interval, array: any[]) => SonicWeaveValue,
  array?: any[]
) {
  array ??= this.context.get('$') as Interval[];
  const filtered = filter.bind(this)(tester, array);
  array.length = 0;
  array.push(...filtered);
}

function arrayReduce(
  this: ExpressionVisitor,
  reducer: (
    previousValue: any,
    currentValue: any,
    currentIndex: Interval,
    array: any[]
  ) => any,
  initialValue: any,
  array?: any[]
) {
  reducer = reducer.bind(this);
  array ??= this.context.get('$') as Interval[];
  return array.reduce(
    (value, currentValue, currentIndex, arr) =>
      reducer(value, currentValue, Interval.fromInteger(currentIndex), arr),
    initialValue
  );
}

function isArray(value: any) {
  return sonicBool(Array.isArray(value));
}

function toString_(value: SonicWeaveValue | null, depth = 2): string {
  if (value === null) {
    return '';
  }
  if (value === undefined) {
    return 'niente';
  }
  if (value instanceof Interval) {
    return value.toString();
  }
  if (Array.isArray(value)) {
    if (depth < 0) {
      return '[Array]';
    }
    return '[' + value.map(e => toString_(e, depth - 1)).join(', ') + ']';
  }
  return inspect(value, {depth});
}

export function toString(value: SonicWeaveValue) {
  return toString_(value);
}

function print(...args: any[]) {
  console.log(...args.map(a => toString(a)));
}

function dir(arg: any) {
  console.dir(arg, {depth: null});
}

export const BUILTIN_CONTEXT: Record<string, Interval | Function> = {
  // Constants
  E,
  PI,
  TAU,
  // Second-party wrappers
  mosSubset,
  isPrime: isPrime_,
  primes: primes_,
  // Domain conversion
  simplify,
  linear,
  logarithmic,
  cologarithmic,
  relin,
  ablin,
  relog,
  ablog,
  // Type conversion
  bool,
  int: trunc,
  decimal,
  fraction,
  radical,
  cents,
  absoluteFJS,
  FJS,
  monzo: toMonzo,
  // Integer conversion
  floor,
  round,
  trunc,
  ceil,
  // Other
  hasConstantStructure,
  toString,
  slice,
  upsAs,
  zip,
  zipLongest,
  abs,
  min,
  max,
  random,
  randomCents,
  isArray,
  sort,
  reverse,
  pop,
  push,
  shift,
  unshift,
  length,
  print,
  dir,
  map,
  remap,
  filter,
  distill,
  arrayReduce,
  kCombinations,
};

export const PRELUDE_SOURCE = `
// == Constants ==
riff niente { return; }
niente = niente();

// == Functions ==
riff sqrt x { return x ~^ 1/2; }
riff cbrt x { return x ~^ 1/3; }

riff mtof index { return 440 Hz * 2^((index - 69) % 12); }
riff ftom freq { return freq % 440 Hz log 2 * 12 + 69; }

riff void {
  return;
}

riff sum terms {
  return arrayReduce(total, element => total +~ element, 0, terms);
}

riff prod factors {
  return arrayReduce(total, element => total *~ element, 1, factors);
}

riff cumsum array {
  array;
  i = 0;
  while (++i < length($))
    $[i] ~+= $[i-1];
}

riff cumprod array {
  array;
  i = 0;
  while (++i < length($))
    $[i] ~*= $[i-1];
}

riff label labels scale {
  scale ??= $$;
  for ([i, l] of zip(scale, labels)) {
    void(i l);
  }
}

// == Scale generation ==
riff ed divisions equave {
  [1..divisions];
  if (equave === niente) step => step \\ divisions;
  else step => step \\ divisions < equave >;
}

riff subharmonics start end {
  start::end;
  invert();
}

riff mos numberOfLargeSteps numberOfSmallSteps sizeOfLargeStep sizeOfSmallStep up down equave {
  mosSubset(numberOfLargeSteps, numberOfSmallSteps, sizeOfLargeStep, sizeOfSmallStep, up, down);
  divisions = $[-1];
  if (equave === niente) step => step \\ divisions;
  else step => step \\ divisions < equave >;
}

riff rank2 generator up down period numPeriods {
  down ??= 0;
  period ??= 2;
  numPeriods ??= 1;
  accumulator = 1;
  while (up--) {
    accumulator *~= generator;
    accumulator;
  }
  accumulator = 1;
  while (down--) {
    accumulator %~= generator;
    accumulator;
  }
  period;
  reduce();
  sort();
  repeat(numPeriods);
}

riff cps factors count equave withUnity {
  equave ??= 2;
  for (combination of kCombinations(factors, count))
    prod(combination);
  sort();
  if (!withUnity) ground();
  equave;
  reduce();
  sort();
}

riff wellTemperament commaFractions comma up down generator period {
  comma ??= 81/80;
  up ??= 11;
  down ??= 11 - up;
  generator ??= 3/2;
  period ??= 2;

  accumulator = 1;
  i = 0;
  while (i < up) {
    accumulator *~= generator ~* comma ~^ commaFractions[down + i++];
    accumulator;
  }

  accumulator = 1;
  i = 0;
  while (i < down) {
    accumulator %~= generator ~* comma ~^ commaFractions[down - 1 - i++];
    accumulator;
  }
  period;
  reduce();
  sort();
}

riff spanLattice basis ups downs equave {
  basis = basis[..];
  ups = ups[..] if ups else [];
  downs = downs[..] if downs else [];
  equave ??= 2;
  while (length(ups) < length(basis)) push(1, ups);
  while (length(downs) < length(basis)) push(0, downs);

  1;

  while (basis) {
    generator = pop(basis);
    up = pop(ups);
    down = pop(downs);

    for (root of $$) {
      accumulator = root;
      u = up;
      while (u--) {
        accumulator *~= generator;
        accumulator;
      }
      accumulator = root;
      d = down;
      while (d--) {
        accumulator %~= generator;
        accumulator;
      }
    }
  }

  void(shift());
  equave;
  reduce();
  sort();
}

riff eulerGenus guide root equave {
  root ??= 1;
  equave ??= 2;
  if (guide ~mod root) {
    throw "Root must divide the guide tone";
  }

  remainder = 0;
  while (++remainder < equave) {
    n = remainder;
    while (n <= guide) {
      if (!(guide ~mod n)) n;
      n ~+= equave;
    }
  }
  i => i ~% root ~red equave;
  sort();
  void(shift());
  equave;
}

riff octaplex b0 b1 b2 b3 equave withUnity {
  equave ??= 2;
  for (s1 of [-1, 1]) {
    for (s2 of [-1, 1]) {
      b0 ~^ s1 ~* b1 ~^ s2;
      b0 ~^ s1 ~* b2 ~^ s2;
      b0 ~^ s1 ~* b3 ~^ s2;
      b1 ~^ s1 ~* b3 ~^ s2;
      b2 ~^ s1 ~* b3 ~^ s2;
      b1 ~^ s1 ~* b2 ~^ s2;
    }
  }
  sort();
  if (!withUnity) ground();
  equave;
  reduce();
  sort();
}

riff ags generators ordinal period numPeriods maxSize {
  ordinal ??= 1;
  period ??= 2;
  numPeriods ??= 1;
  maxSize ??= 100;
  cumprod(generators);
  accumulator = $[-1];
  period;
  reduce();
  sort();
  i = 0;
  while (ordinal) {
    accumulator *~= generators[i++ mod length(generators)];
    push(accumulator red period, $$);
    if (length($$) > maxSize) {
      throw "No constant structure found before reaching maximum size";
    }
    sort($$);
    if (hasConstantStructure($$)) {
      void(ordinal--);
    }
  }
  repeat(numPeriods);
}

// == Scale modification ==
riff reduce scale {
  $ = scale ?? $$;
  equave = pop();
  i => i ~red equave;
  equave;
  return;
}

riff invert scale {
  $ = scale ?? $$;
  equave = pop();
  i => equave %~ i;
  reverse();
  equave;
  return;
}

riff rotate onto scale {
  onto ??= 1;
  $ = scale ?? $$;
  equave = $[-1];
  while (--onto) equave *~ shift();
  root = shift();
  i => i ~% root;
  equave;
  return;
}

riff clear scale {
  $ = scale ?? $$;
  while ($) void(pop());
  return;
}

riff repeat times {
  times ??= 2;
  scale = $$;
  if (!times) {
    return clear(scale);
  }
  equave = scale[-1];
  while (--times) {
    scale;
    i => i ~* equave ~^ times;
  }
}

riff ground scale {
  $ = scale ?? $$;
  root = shift();
  i => i ~% root;
  return;
}

riff subset indices scale {
  scale ??= $$;
  distill(_, i => i of indices, scale);
}

riff toSubharmonics overtone scale {
  $ = scale ?? $$;
  i => %~(%~i to~ %~overtone);
  return;
}

// Assumes a sorted scale
riff keepUnique scale {
  scale ??= $$;
  last = niente;
  i = length(scale);
  while (i--) {
    current = shift(scale);
    if (last != current) {
      current;
      last = current;
    }
  }
  i => push(i, scale);
  return;
}

riff mergeOffset offsets overflow scale {
  overflow ??= 'drop';
  if (!isArray(offsets)) offsets = [offsets];
  $ = scale ?? $$;
  equave = pop();

  unshift(equave ~^ 0);
  copies = $ ~tns offsets;
  void(shift());

  if (overflow === 'drop') {
    remap(copy => filter(i => i > 1 && i < equave, copy), copies);
  } else if (overflow === 'wrap') {
    remap(copy => map(i => i ~red equave, copy), copies);
  }

  copies;
  sort();
  equave;
  keepUnique();
  return;
}

riff stretch amount scale {
  $ = scale ?? $$;
  i => i ~^ amount;
  return;
}

riff randomVariance amount varyEquave scale {
  $ = scale ?? $$;
  if (!varyEquave) equave = pop();
  i => i ~* (amount ~^ (2 * random() - 1));
  if (!varyEquave) equave;
  return;
}
`;
