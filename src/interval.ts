import {
  IntervalLiteral,
  NedjiLiteral,
  addNodes,
  divNodes,
  mulNodes,
  projectNodes,
  subNodes,
  literalToString,
  modNodes,
  roundToNodes,
  validateNode,
} from './expression';
import {Domain, TimeMonzo} from './monzo';
import {asAbsoluteFJS, asFJS} from './fjs';
import {RootContext} from './context';
import {ONE, ZERO, countUpsAndLifts} from './utils';

export type IntervalDomain = Exclude<Domain, 'cologarithmic'>;

export class Color {
  value: string;

  constructor(value: string) {
    this.value = value;
  }

  toString() {
    return this.value.replace(/%/g, '');
  }
}

const TWO = new TimeMonzo(ZERO, [ONE]);

function logLinMul(
  logarithmic: Interval,
  linear: Interval,
  node?: IntervalLiteral,
  zombie?: Interval
) {
  if (linear.node?.type === 'DecimalLiteral' && linear.node.flavor === 'r') {
    const size = logarithmic.totalCents();
    return new Interval(
      TimeMonzo.fromCents(size * linear.value.valueOf()),
      logarithmic.domain,
      node,
      zombie
    );
  }
  const value = logarithmic.value.pow(linear.value);
  if (
    logarithmic.node?.type === 'FJS' ||
    logarithmic.node?.type === 'AspiringFJS'
  ) {
    node = {type: 'AspiringFJS', flavor: ''};
  }
  return new Interval(value, logarithmic.domain, node, zombie);
}

export function infect(left: Interval, right: Interval) {
  ZOMBIE.color = left.color ?? right.color;
  ZOMBIE.label = left.label || right.label;
  return ZOMBIE;
}

export function log(left: Interval, right: Interval) {
  const log = left.value.log(right.value);
  if (typeof log === 'number') {
    return TimeMonzo.fromValue(log);
  } else {
    return TimeMonzo.fromFraction(log);
  }
}

export class Interval {
  value: TimeMonzo;
  domain: IntervalDomain;
  node?: IntervalLiteral;
  color?: Color;
  label: string;

  constructor(
    value: TimeMonzo,
    domain: IntervalDomain,
    node?: IntervalLiteral,
    convert?: Interval
  ) {
    validateNode(node);
    this.value = value;
    this.domain = domain;
    this.node = node;
    if (convert !== undefined) {
      this.color = convert.color;
      this.label = convert.label;
    } else {
      this.label = '';
    }
  }

  static fromInteger(value: number | bigint, convert?: Interval) {
    value = BigInt(value);
    const monzo = TimeMonzo.fromBigInt(value);
    return new Interval(
      monzo,
      'linear',
      {type: 'IntegerLiteral', value},
      convert
    );
  }

  shallowClone(): Interval {
    return new Interval(this.value, this.domain, this.node, this);
  }

  toInteger(): number {
    return Number(this.value.toBigInteger());
  }

  isRelative() {
    return !this.value.timeExponent.n;
  }

  isAbsolute() {
    return !!this.value.timeExponent.n;
  }

  totalCents() {
    return this.value.totalCents();
  }

  neg() {
    if (this.domain === 'linear') {
      return new Interval(this.value.neg(), this.domain, undefined, this);
    }
    return new Interval(this.value.inverse(), this.domain, undefined, this);
  }

  inverse() {
    if (this.domain === 'linear') {
      return new Interval(this.value.inverse(), this.domain, undefined, this);
    }
    // This overload should be fine because multiplication is not implemented in the logarithmic domain.
    return new Val(this.value.geometricInverse(), this.value.clone());
  }

  abs() {
    if (this.domain === 'linear') {
      return new Interval(this.value.abs(), this.domain, undefined, this);
    }
    return new Interval(this.value.pitchAbs(), this.domain, undefined, this);
  }

  project(base: Interval) {
    const node = projectNodes(this.node, base.node);
    return new Interval(
      base.value.pow(this.value.octaves),
      'logarithmic',
      node,
      infect(this, base)
    );
  }

  add(other: Interval) {
    if (this.domain !== other.domain) {
      throw new Error('Domains must match in addition');
    }
    let node = addNodes(this.node, other.node);
    const value =
      this.domain === 'linear'
        ? this.value.add(other.value)
        : this.value.mul(other.value);
    if (!node && this.node?.type === other.node?.type) {
      node = timeMonzoAs(value, this.node, true);
    }
    const zombie = infect(this, other);
    return new Interval(value, this.domain, node, zombie);
  }

  sub(other: Interval) {
    if (this.domain !== other.domain) {
      throw new Error('Domains must match in subtraction');
    }
    let node = subNodes(this.node, other.node);
    const value =
      this.domain === 'linear'
        ? this.value.sub(other.value)
        : this.value.div(other.value);
    if (!node && this.node?.type === other.node?.type) {
      node = timeMonzoAs(value, this.node, true);
    }
    const zombie = infect(this, other);
    return new Interval(value, this.domain, node, zombie);
  }

  lsub(other: Interval) {
    const result = other.sub(this);
    result.color = this.color ?? other.color;
    result.label = this.label || other.label;
    return result;
  }

  lensAdd(other: Interval) {
    if (this.domain !== other.domain) {
      throw new Error('Domains must match in harmonic addition');
    }
    const zombie = infect(this, other);
    if (this.domain === 'linear') {
      return new Interval(
        this.value.lensAdd(other.value),
        this.domain,
        undefined,
        zombie
      );
    }
    // TODO: Special handling for unison.
    return new Interval(
      this.value
        .geometricInverse()
        .mul(other.value.geometricInverse())
        .geometricInverse(),
      this.domain,
      undefined,
      zombie
    );
  }

  lensSub(other: Interval) {
    if (this.domain !== other.domain) {
      throw new Error('Domains must match in harmonic subtraction');
    }
    const zombie = infect(this, other);
    if (this.domain === 'linear') {
      return new Interval(
        this.value.lensSub(other.value),
        this.domain,
        undefined,
        zombie
      );
    }
    // TODO: Special handling for unison.
    return new Interval(
      this.value
        .geometricInverse()
        .div(other.value.geometricInverse())
        .geometricInverse(),
      this.domain,
      undefined,
      zombie
    );
  }

  roundTo(other: Interval) {
    if (this.domain !== other.domain) {
      throw new Error('Domains must match in rounding');
    }
    const node = roundToNodes(this.node, other.node);
    const zombie = infect(this, other);
    if (this.domain === 'linear') {
      return new Interval(
        this.value.roundTo(other.value),
        this.domain,
        node,
        zombie
      );
    }
    return new Interval(
      this.value.pitchRoundTo(other.value),
      this.domain,
      node,
      zombie
    );
  }

  mmod(other: Interval, ceiling = false) {
    if (this.domain !== other.domain) {
      throw new Error('Domains must match in modulo');
    }
    const node = modNodes(this.node, other.node);
    const zombie = infect(this, other);
    if (this.domain === 'linear') {
      return new Interval(
        this.value.mmod(other.value, ceiling),
        this.domain,
        node,
        zombie
      );
    }
    return new Interval(
      this.value.reduce(other.value, ceiling),
      this.domain,
      node,
      zombie
    );
  }

  pitchRoundTo(other: Interval) {
    if (this.domain === 'logarithmic' || other.domain === 'logarithmic') {
      throw new Error(
        'Exponential rounding not implemented in logarithmic domain'
      );
    }
    if (!other.value.isScalar()) {
      throw new Error('Only scalar exponential rounding implemented');
    }
    return new Interval(
      this.value.pitchRoundTo(other.value),
      this.domain,
      undefined,
      infect(this, other)
    );
  }

  mul(other: Interval): Interval;
  mul(other: Val): Val;
  mul(other: Interval | Val) {
    if (this.domain !== 'linear' && other.domain !== 'linear') {
      throw new Error('At least one domain must be linear in multiplication');
    }
    if (other.domain === 'cologarithmic') {
      return other.mul(this);
    }
    const node = mulNodes(this.node, other.node);
    const zombie = infect(this, other);
    if (other.domain === 'logarithmic') {
      return logLinMul(other, this, node, zombie);
    }
    if (this.domain === 'logarithmic') {
      return logLinMul(this, other, node, zombie);
    }
    return new Interval(this.value.mul(other.value), this.domain, node, zombie);
  }

  div(other: Interval) {
    let node = divNodes(this.node, other.node);
    const zombie = infect(this, other);
    if (other.domain === 'logarithmic') {
      if (this.domain !== 'logarithmic') {
        throw new Error('Domains must match in non-scalar division');
      }
      return new Interval(log(this, other), 'linear', node, zombie);
    }
    if (this.domain === 'logarithmic') {
      const value = this.value.pow(other.value.inverse());
      if (this.node?.type === 'FJS' || this.node?.type === 'AspiringFJS') {
        node = {type: 'AspiringFJS', flavor: ''};
      }
      return new Interval(value, this.domain, node, zombie);
    }
    return new Interval(this.value.div(other.value), this.domain, node, zombie);
  }

  ldiv(other: Interval) {
    const result = other.div(this);
    result.color = this.color ?? other.color;
    result.label = this.label || other.label;
    return result;
  }

  dot(other: Interval | Val) {
    let monzo: TimeMonzo;
    let val: TimeMonzo;
    // Rig ups and downs.
    if (other.domain === 'cologarithmic') {
      monzo = this.value;
      val = other.value.clone();
      val.cents++;
    } else {
      monzo = this.value;
      val = other.value;
    }

    const product = monzo.dot(val);
    const zombie = other instanceof Interval ? infect(this, other) : this;
    if (product.d === 1) {
      const value = BigInt(product.s * product.n);
      return new Interval(
        TimeMonzo.fromBigInt(value),
        'linear',
        {
          type: 'IntegerLiteral',
          value,
        },
        zombie
      );
    }
    return new Interval(
      TimeMonzo.fromFraction(product),
      'linear',
      {
        type: 'FractionLiteral',
        numerator: BigInt(product.s * product.n),
        denominator: BigInt(product.d),
      },
      zombie
    );
  }

  pow(other: Interval) {
    if (this.domain === 'logarithmic' || other.domain === 'logarithmic') {
      throw new Error('Exponentiation not implemented in logarithmic domain');
    }
    if (!other.value.isScalar()) {
      throw new Error('Only scalar exponentiation implemented');
    }
    return new Interval(
      this.value.pow(other.value),
      this.domain,
      undefined,
      infect(this, other)
    );
  }

  ipow(other: Interval) {
    if (this.domain === 'logarithmic' || other.domain === 'logarithmic') {
      throw new Error(
        'Inverse exponentiation not implemented in logarithmic domain'
      );
    }
    if (!other.value.isScalar()) {
      throw new Error('Only scalar inverse exponentiation implemented');
    }
    return new Interval(
      this.value.pow(other.value.inverse()),
      this.domain,
      undefined,
      infect(this, other)
    );
  }

  log(other: Interval) {
    if (this.domain === 'logarithmic' || other.domain === 'logarithmic') {
      throw new Error(
        'Logarithm not implemented in the (already) logarithmic domain'
      );
    }

    return new Interval(
      log(this, other),
      this.domain,
      undefined,
      infect(this, other)
    );
  }

  reduce(other: Interval, ceiling = false) {
    if (this.domain === 'logarithmic' || other.domain === 'logarithmic') {
      throw new Error('Reduction not implemented in logarithmic domain');
    }
    return new Interval(
      this.value.reduce(other.value, ceiling),
      this.domain,
      undefined,
      infect(this, other)
    );
  }

  backslash(other: Interval) {
    if (!this.value.isScalar() || !other.value.isScalar()) {
      throw new Error('Only scalars can be backslashed');
    }
    if (this.domain !== 'linear' || other.domain !== 'linear') {
      throw new Error('Only linear backslashing implemented');
    }
    const value = TWO.pow(this.value.div(other.value));
    let node: NedjiLiteral | undefined;
    if (this.value.isIntegral() && other.value.isIntegral()) {
      node = {
        type: 'NedjiLiteral',
        numerator: this.toInteger(),
        denominator: other.toInteger(),
        equaveNumerator: null,
        equaveDenominator: null,
      };
    }
    return new Interval(value, 'logarithmic', node, infect(this, other));
  }

  compare(other: Interval) {
    return this.value.compare(other.value);
  }

  equals(other: Interval) {
    return this.value.equals(other.value);
  }

  strictEquals(other: Interval) {
    return this.domain === other.domain && this.value.strictEquals(other.value);
  }

  str(context?: RootContext) {
    if (this.node) {
      let node: IntervalLiteral | undefined = this.node;
      let prefix = '';
      let postfix = '';
      if (this.node.type === 'AspiringAbsoluteFJS') {
        if (!context) {
          return this.value.toString(this.domain);
        }
        const C4 = context.C4;
        const relativeToC4 = this.value.div(C4);
        if (context.up.isRealCents() && context.lift.isRealCents()) {
          ({prefix, postfix} = countUpsAndLifts(
            relativeToC4.cents,
            context.up.cents,
            context.lift.cents
          ));
          relativeToC4.cents = 0;
        }

        node = asAbsoluteFJS(relativeToC4, this.node.flavor);
        if (!node) {
          return this.value.toString(this.domain);
        }
      }
      if (this.node.type === 'AspiringFJS') {
        const value = this.value.clone();
        if (value.cents) {
          if (!context) {
            return this.value.toString(this.domain);
          }
          if (context.up.isRealCents() && context.lift.isRealCents()) {
            ({prefix, postfix} = countUpsAndLifts(
              value.cents,
              context.up.cents,
              context.lift.cents
            ));
            value.cents = 0;
          }
        }

        node = asFJS(value, this.node.flavor);
        if (!node) {
          return this.value.toString(this.domain);
        }
      }
      return prefix + literalToString(node) + postfix;
    }
    return this.value.toString(this.domain);
  }

  // "JS" toString or "Python" repr.
  toString(context?: RootContext) {
    const base = this.str(context);
    const color = this.color ? this.color.toString() : '';
    if (this.color || this.label) {
      let result = '(' + base;
      if (color) {
        result += ' ' + color;
      }
      if (this.label) {
        result += ' ' + JSON.stringify(this.label);
      }
      return result + ')';
    }
    return base;
  }

  valueOf() {
    if (this.value.isIntegral()) {
      return Number(this.value.toBigInteger());
    }
    return this.value.valueOf();
  }

  up(context: RootContext) {
    const value = this.value.mul(context.up);
    if (
      this.node?.type === 'FJS' ||
      this.node?.type === 'AbsoluteFJS' ||
      this.node?.type === 'MonzoLiteral' ||
      this.node?.type === 'ValLiteral'
    ) {
      const node = {...this.node};
      node.ups++;
      const result = new Interval(value, this.domain, node, this);
      context.fragiles.push(result);
      return result;
    }
    return new Interval(value, this.domain, undefined, this);
  }

  down(context: RootContext) {
    const value = this.value.div(context.up);
    if (
      this.node?.type === 'FJS' ||
      this.node?.type === 'AbsoluteFJS' ||
      this.node?.type === 'MonzoLiteral' ||
      this.node?.type === 'ValLiteral'
    ) {
      const node = {...this.node};
      node.ups--;
      const result = new Interval(value, this.domain, node, this);
      context.fragiles.push(result);
      return result;
    }
    return new Interval(value, this.domain, undefined, this);
  }

  lift(context: RootContext) {
    const value = this.value.mul(context.lift);
    if (
      this.node?.type === 'FJS' ||
      this.node?.type === 'AbsoluteFJS' ||
      this.node?.type === 'MonzoLiteral' ||
      this.node?.type === 'ValLiteral'
    ) {
      const node = {...this.node};
      node.lifts++;
      const result = new Interval(value, this.domain, node, this);
      context.fragiles.push(result);
      return result;
    }
    return new Interval(value, this.domain, undefined, this);
  }

  drop(context: RootContext) {
    const value = this.value.div(context.lift);
    if (
      this.node?.type === 'FJS' ||
      this.node?.type === 'AbsoluteFJS' ||
      this.node?.type === 'MonzoLiteral' ||
      this.node?.type === 'ValLiteral'
    ) {
      const node = {...this.node};
      node.lifts--;
      const result = new Interval(value, this.domain, node, this);
      context.fragiles.push(result);
      return result;
    }
    return new Interval(value, this.domain, undefined, this);
  }

  break() {
    if (this.node?.type === 'FJS') {
      this.node = {type: 'AspiringFJS', flavor: ''};
    }
    if (this.node?.type === 'AbsoluteFJS') {
      this.node = {type: 'AspiringAbsoluteFJS', flavor: ''};
    }
    if (
      this.node?.type === 'MonzoLiteral' ||
      this.node?.type === 'ValLiteral'
    ) {
      this.node = undefined;
    }
  }
}

// Dummy variable to hold color and label infections.
const ZOMBIE = new Interval(TWO, 'logarithmic');

export class Val {
  value: TimeMonzo;
  equave: TimeMonzo;
  domain = 'cologarithmic' as const;
  node?: IntervalLiteral;

  constructor(value: TimeMonzo, equave: TimeMonzo, node?: IntervalLiteral) {
    if (value.timeExponent.n || equave.timeExponent.n) {
      throw new Error('Only relative vals implemented.');
    }
    this.value = value;
    this.equave = equave;
    this.node = node;
  }

  get divisions() {
    return this.value.dot(this.equave);
  }

  neg() {
    return new Val(this.value.inverse(), this.equave);
  }

  inverse() {
    // This overload should be fine because multiplication is not implemented in the logarithmic domain.
    return new Interval(this.value.geometricInverse(), 'logarithmic');
  }

  abs() {
    return new Val(this.value.pitchAbs(), this.equave);
  }

  up(context: RootContext) {
    const value = this.value.mul(context.up);
    if (this.node?.type === 'ValLiteral') {
      const node = {...this.node};
      node.ups++;
      const result = new Val(value, this.equave, node);
      context.fragiles.push(result);
      return result;
    }
    return new Val(value, this.equave);
  }

  down(context: RootContext) {
    const value = this.value.div(context.up);
    if (this.node?.type === 'ValLiteral') {
      const node = {...this.node};
      node.ups--;
      const result = new Val(value, this.equave, node);
      context.fragiles.push(result);
      return result;
    }
    return new Val(value, this.equave);
  }

  lift(context: RootContext) {
    const value = this.value.mul(context.lift);
    if (this.node?.type === 'ValLiteral') {
      const node = {...this.node};
      node.lifts++;
      const result = new Val(value, this.equave, node);
      context.fragiles.push(result);
      return result;
    }
    return new Val(value, this.equave);
  }

  drop(context: RootContext) {
    const value = this.value.div(context.lift);
    if (this.node?.type === 'ValLiteral') {
      const node = {...this.node};
      node.lifts--;
      const result = new Val(value, this.equave, node);
      context.fragiles.push(result);
      return result;
    }
    return new Val(value, this.equave);
  }

  equals(other: Val) {
    return this.value.equals(other.value) && this.equave.equals(other.equave);
  }

  strictEquals(other: Val) {
    return (
      this.value.strictEquals(other.value) &&
      this.equave.strictEquals(other.equave)
    );
  }

  add(other: Val) {
    if (!this.equave.strictEquals(other.equave)) {
      throw new Error('Val equaves must match in addition');
    }
    const node = addNodes(this.node, other.node);
    const value = this.value.mul(other.value);
    return new Val(value, this.equave, node);
  }

  sub(other: Val) {
    if (!this.equave.strictEquals(other.equave)) {
      throw new Error('Val equaves must match in subtraction');
    }
    const node = subNodes(this.node, other.node);
    const value = this.value.div(other.value);
    return new Val(value, this.equave, node);
  }

  mul(other: Interval) {
    if (other.domain !== 'linear' || other.value.timeExponent.n) {
      throw new Error('Only scalar multiplication implemented for vals.');
    }
    if (other.node?.type === 'DecimalLiteral' && other.node.flavor === 'r') {
      const size = this.value.totalCents() * 1200 ** -2;
      return new Val(
        TimeMonzo.fromCents(size * other.value.valueOf()),
        this.equave
      );
    }
    return new Val(this.value.pow(other.value), this.equave);
  }

  div(other: Interval) {
    if (other.domain !== 'linear' || other.value.timeExponent.n) {
      throw new Error('Only scalar multiplication implemented for vals.');
    }
    const scalar = other.value.inverse();
    return new Val(this.value.pow(scalar), this.equave);
  }

  dot(other: Interval | Val) {
    if (other instanceof Interval) {
      return other.dot(this);
    }

    const product = this.value.dot(other.value);
    if (product.d === 1) {
      const value = BigInt(product.s * product.n);
      return new Interval(TimeMonzo.fromBigInt(value), 'linear', {
        type: 'IntegerLiteral',
        value,
      });
    }
    return new Interval(TimeMonzo.fromFraction(product), 'linear', {
      type: 'FractionLiteral',
      numerator: BigInt(product.s * product.n),
      denominator: BigInt(product.d),
    });
  }

  toString() {
    if (this.node) {
      return literalToString(this.node);
    }
    const result = this.value.toString('cologarithmic');
    if (this.equave.compare(TWO)) {
      return `withEquave(${result}, ${this.equave.toString()})`;
    }
    return result;
  }

  break() {
    this.node = undefined;
  }
}

export function timeMonzoAs(
  monzo: TimeMonzo,
  node: IntervalLiteral | undefined,
  simplify = false
): IntervalLiteral | undefined {
  if (!node) {
    return undefined;
  }
  switch (node.type) {
    case 'IntegerLiteral':
      return monzo.asIntegerLiteral();
    case 'FractionLiteral':
      return monzo.asFractionLiteral(simplify ? undefined : node);
    case 'NedjiLiteral':
      return monzo.asNedjiLiteral(simplify ? undefined : node);
    case 'CentsLiteral':
      return monzo.asCentsLiteral();
    case 'MonzoLiteral':
      return monzo.asMonzoLiteral();
    case 'FJS':
    case 'AspiringFJS':
      return {type: 'AspiringFJS', flavor: ''};
    case 'AbsoluteFJS':
    case 'AspiringAbsoluteFJS':
      return {type: 'AspiringAbsoluteFJS', flavor: ''};
    default:
      return undefined;
  }
}
