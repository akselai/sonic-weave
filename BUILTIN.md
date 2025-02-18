# SonicWeave standard library
<!-- This file has been auto-generated by scripts/builtin-docs.ts !-->
## Built-in functions
### abs
Calculate the absolute value of the interval.
#### Parameters:

`value`

### absolute
Convert interval to absolute representation.
#### Parameters:

`interval`

### absoluteFJS
Convert interval to absolute FJS.
#### Parameters:

`interval`, `flavor = ""`

### acos
Calculate acos x.
#### Parameters:

`x`

### arrayReduce
Reduce the given/current scale to a single value by the `reducer` riff which takes an accumulator, the current value, the current index and the array as arguments.
#### Parameters:

`reducer`, `array`, `initialValue`

### arrayRepeat
Repeat the given/current array or string `count` times.
#### Parameters:

`count`, `array`

### asin
Calculate asin x.
#### Parameters:

`x`

### atan
Calculate atan x.
#### Parameters:

`x`

### atan2
Calculate atan2(x, y).
#### Parameters:

`x`, `y`

### bleach
Get rid of interval coloring and label.
#### Parameters:

`interval`

### bool
Convert value to a boolean.
#### Parameters:

`value`

### ceil
Round value up to the nearest integer.
#### Parameters:

`value`

### cents
Convert interval to cents.
#### Parameters:

`interval`, `fractionDigits`

### centsColor
Color based on the size of the interval. Hue wraps around every 1200 cents.
#### Parameters:

`interval`

### clear
Remove the contents of the current/given scale.
#### Parameters:

`scale`

### clz32
Calculate clz32 x.
#### Parameters:

`x`

### cologarithmic
Convert interval to cologarithmic representation.
#### Parameters:

`interval`

### colorOf
Return the color of the interval.
#### Parameters:

`interval`

### concat
Combine two or more arrays/strings.
#### Parameters:

`first`, `...rest`

### cos
Calculate cos x.
#### Parameters:

`x`

### cosJIP
Cosine of the angle between the val and the just intonation point. Weighting is either "none" or "tenney".
#### Parameters:

`val`, `weighting = "tenney"`

### decimal
Convert interval to a decimal number.
#### Parameters:

`interval`, `fractionDigits`

### dir
Obtain the javascript representation of the value.
#### Parameters:

`arg`

### dislodge
Remove and return the first element equal to the given one from the current/given scale.
#### Parameters:

`element`, `scale`

### distill
Remove intervals from the given/current scale that evaluate to `false` according to the `tester` riff.
#### Parameters:

`tester`, `array`

### doc
Obtain the docstring of the given riff.
#### Parameters:

`riff`

### equaveOf
Return the equave of the val.
#### Parameters:

`val`

### expm1
Calculate expm1 x.
#### Parameters:

`x`

### extend
Extend the first array with the contents of the rest.
#### Parameters:

`first`, `...rest`

### factorColor
Color an interval based on its prime factors.
#### Parameters:

`interval`

### fareyInterior
Generate the interior of the n'th Farey sequence i.e. all fractions between 0 and 1 exclusive with denominater below or at the given limit.
#### Parameters:

`maxDenominator`

### fareySequence
Generate the n'th Farey sequence i.e. all fractions between 0 and 1 inclusive with denominater below or at the given limit.
#### Parameters:

`maxDenominator`

### filter
Obtain a copy of the given/current scale containing values that evaluate to `true` according to the `tester` riff.
#### Parameters:

`tester`, `array`

### FJS
Convert interval to (relative) FJS.
#### Parameters:

`interval`, `flavor = ""`

### floor
Round value down to the nearest integer.
#### Parameters:

`value`

### fraction
Convert interval to a fraction.
#### Parameters:

`interval`, `preferredNumerator`, `preferredDenominator`, `epsilon`

### fround
Calculate fround x.
#### Parameters:

`x`

### gcd
Obtain the largest (linear) multiplicative factor shared by all intervals or the current scale.
#### Parameters:

`...intervals`

### hasConstantStructure
Returns `true` if the current/given scale has constant structure (i.e. every scale degree is unambiguous).
#### Parameters:

`monzos`

### help
Print information about the given riff to the console.
#### Parameters:

`riff`

### hsl
HSL color (Hue range 0-360, Saturation range 0-100, Lightness range 0-100).
#### Parameters:

`hue`, `saturation`, `lightness`

### hsla
HSLA color (Hue range 0-360, Saturation range 0-100, Lightness range 0-100, Alpha range 0-1).
#### Parameters:

`hue`, `saturation`, `lightness`, `alpha`

### imul
Calculate imul x.
#### Parameters:

`x`

### insert
Insert an interval into the current/given scale keeping it sorted.
#### Parameters:

`interval`, `scale`

### int
Truncate value towards zero to the nearest integer.
#### Parameters:

`value`

### isAbsolute
Return `true` if the interval belongs to the absolute echelon.
#### Parameters:

`interval`

### isArray
Return `true` if the value is an array.
#### Parameters:

`value`

### isColor
Return `true` if the value is a color.
#### Parameters:

`value`

### isFunction
Return `true` if the value is a riff or an arrow function.
#### Parameters:

`value`

### isInterval
Return `true` if the value is an interval.
#### Parameters:

`value`

### isLinear
Return `true` if the interval belongs to the linear domain.
#### Parameters:

`interval`

### isLogarithmic
Return `true` if the interval belongs to the logarithmic domain.
#### Parameters:

`interval`

### isPrime
Return `true` if `n` is a prime number, `false` otherwise.
#### Parameters:

`n`

### isRelative
Return `true` if the interval belongs to the relative echelon.
#### Parameters:

`interval`

### isString
Return `true` if the value is a string.
#### Parameters:

`value`

### JIP
The Just Intonation Point. Converts intervals to real cents.
#### Parameters:

`interval`

### kCombinations
Obtain all k-sized combinations in a set
#### Parameters:

`set`, `k`

### labelOf
Return the label of the interval.
#### Parameters:

`interval`

### lcm
Obtain the smallest (linear) interval that shares all intervals or the current scale as multiplicative factors.
#### Parameters:

`...intervals`

### length
Return the number of intervals in the scale.
#### Parameters:

`scale`

### linear
Convert interval to linear representation.
#### Parameters:

`interval`

### log1p
Calculate log1p x.
#### Parameters:

`x`

### logarithmic
Convert interval to logarithmic representation.
#### Parameters:

`interval`

### map
Map a riff over the given/current scale producing a new scale.
#### Parameters:

`mapper`, `array`

### maximum
Obtain the argument with the maximum value.
#### Parameters:

`...args`

### minimum
Obtain the argument with the minimum value.
#### Parameters:

`...args`

### monzo
Convert interval to a prime count vector a.k.a. monzo.
#### Parameters:

`interval`

### mosSubset
Calculate a subset of equally tempered degrees with maximum variety two per scale degree.
#### Parameters:

`numberOfLargeSteps`, `numberOfSmallSteps`, `sizeOfLargeStep`, `sizeOfSmallStep`, `up`, `down`

### nedji
Convert interval to N steps of equally divided just intonation.
#### Parameters:

`interval`, `preferredNumerator`, `preferredDenominator`, `preferredEquaveNumerator`, `preferredEquaveDenominator`

### numComponents
Get/set the number of prime exponents to support in monzos. Also sets the length of vals.
#### Parameters:

`value`

### pop
Remove and return the last interval in the current/given scale. Optionally an index to pop may be given.
#### Parameters:

`scale`, `index`

### popAll
Remove and return all intervals in the current/given scale.
#### Parameters:

`scale`

### PrimeMapping
Construct a prime mapping for tempering intervals to specified cents. Remaining primes are left untempered.
#### Parameters:

`...newPrimes`

### primes
Obtain an array of prime numbers such that start <= p <= end.
#### Parameters:

`start`, `end`

### print
Print the arguments to the console.
#### Parameters:

`...args`

### push
Append an interval onto the current/given scale. Optionally an index to push after may be given.
#### Parameters:

`interval`, `scale`, `index`

### radical
Convert interval to a radical expression.
#### Parameters:

`interval`, `maxIndex`, `maxHeight`

### random
Obtain a random value between (linear) 0 and 1.
_(No parameters)_

### randomCents
Obtain random cents between (logarithmic) 0.0c and 1.0c.
_(No parameters)_

### relative
Convert interval to relative representation.
#### Parameters:

`interval`

### remap
Map a riff over the given/current scale replacing the contents.
#### Parameters:

`mapper`, `array`

### repr
Obtain a string representation of the value (with color and label).
#### Parameters:

`value`

### reverse
Reverse the order of the current/given scale.
#### Parameters:

`scale`

### reversed
Obtain a copy of the current/given scale in reversed order.
#### Parameters:

`scale`

### rgb
RGB color (Red range 0-255, Green range 0-255, Blue range 0-255).
#### Parameters:

`red`, `green`, `blue`

### rgba
RGBA color (Red range 0-255, Green range 0-255, Blue range 0-255, Alpha range 0-1).
#### Parameters:

`red`, `green`, `blue`, `alpha`

### round
Round value to the nearest integer.
#### Parameters:

`value`

### shift
Remove and return the first interval in the current/given scale.
#### Parameters:

`scale`

### simplify
Get rid of interval formatting.
#### Parameters:

`interval`

### sin
Calculate sin x.
#### Parameters:

`x`

### slice
Obtain a slice of a string or scale between the given indices.
#### Parameters:

`array`, `indexStart`, `indexEnd`

### sort
Sort the current/given scale in ascending order.
#### Parameters:

`scale`, `compareFn`

### sorted
Obtain a sorted copy of the current/given scale in ascending order.
#### Parameters:

`scale`, `compareFn`

### str
Obtain a string representation of the value (w/o color or label).
#### Parameters:

`value`

### tail
Return the higher prime tail of an interval starting from the given index. Prime 2 has index 0.
#### Parameters:

`interval`, `index`

### tan
Calculate tan x.
#### Parameters:

`x`

### tenneyHeight
Calculate the Tenney height of the interval. Natural logarithm of numerator times denominator.
#### Parameters:

`interval`

### trunc
Truncate value towards zero to the nearest integer.
#### Parameters:

`value`

### trunc
Truncate value towards zero to the nearest integer.
#### Parameters:

`value`

### unshift
Prepend an interval at the beginning of the current/given scale.
#### Parameters:

`interval`, `scale`

### withEquave
Change the equave of the val.
#### Parameters:

`val`, `equave`

### zip
Combine elements of each array into tuples until one of them is exhausted.
#### Parameters:

`...args`

### zipLongest
Combine elements of each array into tuples until all of them are exhausted. Pads missing values with `niente`.
#### Parameters:

`...args`

## Prelude functions
### ablin
Convert interval to absolute linear representation.
#### Parameters:

`interval`

### ablog
Convert interval to absolute logarithmic representation.
#### Parameters:

`interval`

### absoluteHEJI
Convert interval to absolute FJS using HEJI comma flavors.
#### Parameters:

`interval`

### absoluteNFJS
Convert interval to absolute FJS using neutral comma flavors.
#### Parameters:

`interval`

### acosh
Calculate the inverse hyperbolic cosine of x.
#### Parameters:

`x`

### add
Calculate the (linear) sum of the arguments.
#### Parameters:

`...terms`

### antiperiodiff
Calculate the cumulative geometric sums of a periodic difference pattern. Undoes what periodiff does.
#### Parameters:

`constantOfIntegration`, `array`

### asinh
Calculate the inverse hyperbolic sine of x.
#### Parameters:

`x`

### atanh
Calculate the inverse hyperbolic tangent of x.
#### Parameters:

`x`

### avg
Calculate the arithmetic mean of the terms.
#### Parameters:

`...terms`

### cbrt
Calculate the cube root of the input.
#### Parameters:

`x`

### circleDifference
Calculate the geometric difference of two intervals on a circle.
#### Parameters:

`a`, `b`, `equave`

### circleDistance
Calculate the geometric distance of two intervals on a circle.
#### Parameters:

`a`, `b`, `equave`

### coalesce
Coalesce intervals in the current/given scale separated by `tolerance` (default 3.5 cents) into one. `action` is one of 'simplest', 'lowest', 'highest', 'avg', 'havg' or 'geoavg' defaulting to 'simplest'.
#### Parameters:

`tolerance`, `action`, `scale`

### coalesced
Obtain a copy of the current/given scale where groups of intervals separated by `tolerance` (default 3.5 cents) are coalesced into one. `action` is one of 'simplest', 'lowest', 'highest', 'avg', 'havg' or 'geoavg' defaulting to 'simplest'.
#### Parameters:

`tolerance`, `action`, `scale`

### colorsOf
Obtain an array of colors of the current/given scale.
#### Parameters:

`scale`

### concordanceShell
Generate a concordance shell i.e. a vertically aligned object reduced to an equal temperament (default `12`). Intervals are labeled by their harmonics. `tolerance` defaults to `5c`. `equave` defaults to `2/1`.
#### Parameters:

`denominator`, `maxNumerator`, `divisions`, `tolerance`, `equave`

### cosh
Calculate the hyperbolic cosine of x.
#### Parameters:

`x`

### cps
Generate a combination product set from the given factors and combination size.
#### Parameters:

`factors`, `count`, `equave`, `withUnity`

### csgs
Generate a constant structure generator sequence. Zero ordinal corresponds to the (trivial) stack of all generators while positive ordinals denote scales with constant structure ordered by increasing size.
#### Parameters:

`generators`, `ordinal`, `period`, `numPeriods`, `maxSize`

### cumprod
Calculate the cumulative products of the factors in the array i.e. logarithmic cumulative sums.
#### Parameters:

`array`

### cumsum
Calculate the cumulative sums of the terms in the array.
#### Parameters:

`array`

### diff
Calculate the (linear) differences between the terms.
#### Parameters:

`array`

### ed
Generate an equal temperament with the given number of divisions of the given equave/octave.
#### Parameters:

`divisions`, `equave`

### elevate
Remove denominators and make the root explicit in the current/given scale.
#### Parameters:

`scale`

### elevated
Obtain a copy of the current/given scale with denominators removed and the root made explicit.
#### Parameters:

`scale`

### enumerate
Produce an array of [index, element] pairs from the given current/given array.
#### Parameters:

`array`

### equalize
Quantize the current/given scale to given equal divisions of its equave.
#### Parameters:

`divisions`, `scale`

### equalized
Obtain a copy of the current/given scale quantized to given equal divisions of its equave.
#### Parameters:

`divisions`, `scale`

### eulerGenus
Span a lattice from all divisors of the guide-tone rotated to the root-tone.
#### Parameters:

`guide`, `root`, `equave`

### exp
Calculate e raised to the power of x.
#### Parameters:

`x`

### flatRepeat
Repeat the current/given intervals as-is without accumulating equaves. Clears the scale if the number of repeats is zero.
#### Parameters:

`times`, `scale`

### flatten
Flatten a nested array into a simple array.
#### Parameters:

`array`

### ftom
Convert absolute frequency to MIDI note number / MTS value (fractional semitones with A440 = 69).
#### Parameters:

`freq`

### geoavg
Calculate the geometric mean of the factors.
#### Parameters:

`...factors`

### geodiff
Calculate the geometric differences between the factors.
#### Parameters:

`array`

### ground
Use the first interval in the current/given scale as the implicit unison.
#### Parameters:

`scale`

### grounded
Obtain a copy of the current/given scale that uses the first interval as the implicit unison.
#### Parameters:

`scale`

### gs
Stack a periodic array of generators up to the given size which must be a multiple of the number of periods.
#### Parameters:

`generators`, `size`, `period`, `numPeriods`

### harmonicsOf
Obtain a copy of the current/given scale quantized to harmonics of the given fundamental.
#### Parameters:

`fundamental`, `scale`

### havg
Calculate the harmonic mean of the terms.
#### Parameters:

`...terms`

### HEJI
Convert interval to (relative) FJS using HEJI comma flavors.
#### Parameters:

`interval`

### hypot
Calculate the square root of the sum of squares of the arguments.
#### Parameters:

`...args`

### keepUnique
Only keep unique intervals in the current/given scale.
#### Parameters:

`scale`

### label
Apply labels (or colors) from the first array to the current/given scale. Can also apply a single color to the whole scale.
#### Parameters:

`labels`, `scale`

### labeled
Apply labels (or colors) from the first array to a copy of the current/given scale. Can also apply a single color to the whole scale.
#### Parameters:

`labels`, `scale`

### labelsOf
Obtain an array of labels of the current/given scale.
#### Parameters:

`scale`

### log
Calculate the logarithm of x base y. Base defaults to E.
#### Parameters:

`x`, `y`

### log10
Calculate the logarithm of x base 10.
#### Parameters:

`x`

### log2
Calculate the logarithm of x base 2.
#### Parameters:

`x`

### mergeOffset
Merge the given offset or polyoffset of the current/given scale onto itself. `overflow` is one of 'keep', 'drop' or 'wrap' and controls what to do with offset intervals outside of current bounds.
#### Parameters:

`offsets`, `overflow`, `scale`

### mos
Generate a Moment-Of-Symmetry scale with the given number number of large and small steps.   Size of the large step defaults to 2. Size of the small step defaults to 1.   `up` defines the brightness of the mode i.e. the number of major intervals from the root.   Alternatively `down` defines the darkness of the mode i.e. the number of minor intervals from the root.   The default `equave` is the octave `2/1`.
#### Parameters:

`numberOfLargeSteps`, `numberOfSmallSteps`, `sizeOfLargeStep`, `sizeOfSmallStep`, `up`, `down`, `equave`

### mtof
Convert MIDI note number to absolute frequency.
#### Parameters:

`index`

### mul
Calculate the (linear) product of the arguments i.e. the logarithmic sum.
#### Parameters:

`...factors`

### NFJS
Convert interval to (relative) FJS using neutral comma flavors.
#### Parameters:

`interval`

### o
Obtain a copy of the current/given scale in the default overtonal interpretation.
#### Parameters:

`scale`

### octaplex
Generate a 4-dimensional octaplex a.k.a. 20-cell from the given basis intervals.
#### Parameters:

`b0`, `b1`, `b2`, `b3`, `equave`, `withUnity`

### periodiff
Calculate the geometric differences of the periodic interval pattern.
#### Parameters:

`array`

### periostack
Stack the current/given inflections along with the guide generator into a periodic sequence of steps.
#### Parameters:

`guideGenerator`, `array`

### pow
Calculate x to the power of y.
#### Parameters:

`x`, `y`

### prod
Calculate the (linear) product of the factors or the current scale i.e. the logarithmic sum.
#### Parameters:

`factors`

### randomVariance
Add random variance to the current/given scale.
#### Parameters:

`amount`, `varyEquave`, `scale`

### randomVaried
Obtain a copy of the current/given scale with random variance added.
#### Parameters:

`amount`, `varyEquave`, `scale`

### rank2
Generate a finite segment of a Rank-2 scale generated by stacking the given generator against the given period (or the octave `2/1` by default). `up` and `down` must be multiples of `numPeriods`.
#### Parameters:

`generator`, `up`, `down`, `period`, `numPeriods`

### reduce
Reduce the current/given scale by its equave.
#### Parameters:

`scale`

### reduced
Obtain a copy of the current/given scale reduced by its equave.
#### Parameters:

`scale`

### reflect
Reflect the current/given scale about unison.
#### Parameters:

`scale`

### reflected
Obtain a copy of the current/given scale reflected about unison.
#### Parameters:

`scale`

### relin
Convert interval to relative linear representation.
#### Parameters:

`interval`

### relog
Convert interval to relative logarithmic representation.
#### Parameters:

`interval`

### repeat
Stack the current scale on top of itself. Clears the scale if the number of repeats is zero.
#### Parameters:

`times`, `scale`

### repeated
Stack the current/given scale on top of itself.
#### Parameters:

`times`, `scale`

### replace
Replace occurences of `interval` in the current/given scale by `replacement`.
#### Parameters:

`interval`, `replacement`, `scale`

### replaced
Obtain a copy of the current/given scale with occurences of `interval` replaced by `replacement`.
#### Parameters:

`interval`, `replacement`, `scale`

### replaceStep
Replace relative occurences of `step` in the current/given scale by `replacement`.
#### Parameters:

`step`, `replacement`, `scale`

### retrovert
Retrovert the current/given scale (negative harmony i.e reflect and transpose).
#### Parameters:

`scale`

### retroverted
Obtain an retroverted copy of the current/given scale (negative harmony i.e. reflect and transpose).
#### Parameters:

`scale`

### revpose
Change the sounding direction. Converts a descending scale to an ascending one.
#### Parameters:

`scale`

### revposed
Obtain a copy of the current/given scale that sounds in the opposite direction.
#### Parameters:

`scale`

### rotate
Rotate the current/given scale onto the given degree.
#### Parameters:

`onto`, `scale`

### rotated
Obtain a copy of the current/given scale rotated onto the given degree.
#### Parameters:

`onto`, `scale`

### sanitize
Get rid of interval formatting, color and label.
#### Parameters:

`interval`

### sign
Calculate the sign of x.
#### Parameters:

`x`

### sinh
Calculate the hyperbolic sine of x.
#### Parameters:

`x`

### spanLattice
Span a lattice by extending a basis combinatorically.
#### Parameters:

`basis`, `ups`, `downs`, `equave`

### sqrt
Calculate the square root of the input.
#### Parameters:

`x`

### stack
Cumulatively stack the current/given intervals on top of each other.
#### Parameters:

`array`

### stepReplaced
Obtain a copy of the current/given scale with relative occurences of `step` replaced by `replacement`.
#### Parameters:

`step`, `replacement`, `scale`

### stretch
Stretch the current/given scale by the given amount. A value of `1` corresponds to no change.
#### Parameters:

`amount`, `scale`

### stretched
Obtain a copy of the current/given scale streched by the given amount. A value of `1` corresponds to no change.
#### Parameters:

`amount`, `scale`

### subharmonics
Generate a subharmonic segment including the given start and end points.
#### Parameters:

`start`, `end`

### subharmonicsOf
Obtain a copy of the current/given scale quantized to subharmonics of the given overtone.
#### Parameters:

`overtone`, `scale`

### subset
Only keep the given degrees of the current/given scale. Omitting the zero degree rotates the scale.
#### Parameters:

`degrees`, `scale`

### subsetOf
Obtain a copy of the current/given scale with only the given degrees kept. Omitting the zero degree rotates the scale.
#### Parameters:

`degrees`, `scale`

### sum
Calculate the (linear) sum of the terms or the current scale.
#### Parameters:

`terms`

### tanh
Calculate the hyperbolic tangent of x.
#### Parameters:

`x`

### toHarmonics
Quantize the current/given scale to harmonics of the given fundamental.
#### Parameters:

`fundamental`, `scale`

### toSubharmonics
Quantize the current/given scale to subharmonics of the given overtone.
#### Parameters:

`overtone`, `scale`

### tune
Find a combination of two vals that is closer to just intonation.
#### Parameters:

`a`, `b`, `numIter`, `weighting`

### tune3
Find a combination of three vals that is closer to just intonation.
#### Parameters:

`a`, `b`, `c`, `numIter`, `weighting`

### u
Obtain a undertonal reflection of the current/given overtonal scale.
#### Parameters:

`scale`

### uniquesOf
Obtain a copy of the current/given scale with only unique intervals kept.
#### Parameters:

`scale`

### unperiostack
Convert the current/given periodic sequence of steps into inflections of the last interval as the guide generator.
#### Parameters:

`array`

### unstack
Unstack the current/given scale into steps.
#### Parameters:

`array`

### vao
Generate a vertically aligned object i.e. a subset of the harmonic series that sounds like the given equal temperament (default `12`) within the given tolerance (default `5c`). Harmonics equated by the `equave` (default `2/1`) are only included once. The returned segment begins at unison.
#### Parameters:

`denominator`, `maxNumerator`, `divisions`, `tolerance`, `equave`

### void
Get rid of expression results. `void(i++)` increments the value but doesn't push anything onto the scale.
_(No parameters)_

### wellTemperament
Generate a well-temperament by cumulatively modifying the pure fifth `3/2` (or a given generator) by fractions of the syntonic/given comma.
#### Parameters:

`commaFractions`, `comma`, `down`, `generator`, `period`

### withOffset
Obtain a copy of the current/given scale with the given offset or polyoffset merged into it. `overflow` is one of 'keep', 'drop' or 'wrap' and controls what to do with offset intervals outside of current bounds.
#### Parameters:

`offsets`, `overflow`, `scale`

