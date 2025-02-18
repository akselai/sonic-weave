# SonicWeave extra comma flavors

These inflections always go in the direction of the arrow so `6/5` ~ `m3^5h` instead of `m3_5` as in plain FJS.

## Helmholtz-Ellis 2020 + Richie's extension

Updated 2020 version by Marc Sabat and Thomas Nicholson as defined on [XenWiki](https://en.xen.wiki/w/Helmholtz-Ellis_notation) including [Richie's extension](https://en.xen.wiki/w/Richie%27s_HEJI_extensions).

| Prime | Comma       | Size in cents |
| ----- | ----------- | ------------- |
| `5h`  | `81/80`     | `+21.506`     |
| `7h`  | `64/63`     | `+27.264`     |
| `11h` | `33/32`     | `+53.273`     |
| `13h` | `27/26`     | `+65.337`     |
| `17h` | `2187/2176` | `+8.730`      |
| `19h` | `513/512`   | `+3.378`      |
| `23h` | `736/729`   | `+16.544`     |
| `29h` | `261/256`   | `+33.487`     |
| `31h` | `32/31`     | `+54.964`     |
| `37h` | `37/36`     | `+47.434`     |
| `41h` | `82/81`     | `+21.242`     |
| `43h` | `129/128`   | `+13.473`     |
| `47h` | `752/729`   | `+53.777`     |
| `53h` | `54/53`     | `+32.360`     |
| `59h` | `243/236`   | `+50.603`     |
| `61h` | `243/244`   | `+7.110`      |
| `67h` | `2187/2144` | `+34.378`     |
| `71h` | `72/71`     | `+24.213`     |
| `73h` | `73/72`     | `+23.879`     |
| `79h` | `79/81`     | `+43.283`     |
| `83h` | `256/249`   | `+47.998`     |
| `89h` | `729/712`   | `+40.850`     |

## Syntonic rastmic subchroma notation

These inflections follow [Aura's definitions](https://en.xen.wiki/w/Syntonic-rastmic_subchroma_notation) and combine nicely with implicit tempering for easy notation of many equal temperaments.

| Identifier | Name              | Comma           | Size in cents |
| ---------- | ----------------- | --------------- | ------------- |
| `1s`       | Demirasharp*      | `sqrt(243/242)` | `+3.570`      |
| `2s`       | Rasharp           | `243/242`       | `+7.139`      |
| `3s`       | Demisynsharp      | `sqrt(81/80)`   | `+10.753`     |
| `4s`       | Double rasharp    | `243/242 ^ 2`   | `+14.278`     |
| `6s`       | Synsharp          | `81/80`         | `+21.506`     |
| `8s`       | Quadruple rasharp | `243/242 ^ 4`   | `+28.556`     |
| `9s`       | Sesquisynsharp    | `81/80 ^ 3/2`   | `+32.259`     |

\*) Aura uses the *demi-* prefix while the rest of SonicWeave prefers *semi-* but this has no effect on the syntax.

The identifiers stack using concatenation. `C4^12s` is the same as `C4^1s^2s`.

These inflections are designed to be combined with the semisharp `t` and the semiflat `d` A.K.A. demisharp and demiflat to reach rationals. E.g. The tendodemisharp C4 is notated `Ct4^1s` while the artodemisharp C4 is notated `Ct4_1s`.

Remember that the relative counterparts of demisharp intervals are notated using `½d`, `n` and `½A`. E.g. the infra-augmented prime (`729/704`) is notated `½A1^1s` while the artoneutral third (`11/9`) is notated `n3_1s`.

Note that `^1s` coincides with `_11n` from FJS, while `^3s` is a novel inflection not found anywhere else.

Note that in general SonicWeave prefers to call `d1` a "diminished unison", but "diminished prime" should be used in this context. You can learn more about the associated nomenclature in the article on [Alpharabian tuning](https://en.xen.wiki/w/Alpharabian_tuning).

The use of the prefixes "semidiminished" (`sd`) and "semiaugmented" (`sA`) are discouraged when using Syntonic rastmic subchroma inflections.

## HEWM-53

A [variant](http://www.tonalsoft.com/enc/h/hewm.aspx) of Helmholtz-Ellis by Joseph Monzo and Daniel Wolf.

| Prime | Comma       | Size in cents |
| ----- | ----------- | ------------- |
| `5m`  | `81/80`     | `+21.506`     |
| `7m`  | `64/63`     | `+27.264`     |
| `11m` | `33/32`     | `+53.273`     |
| `13m` | `27/26`     | `+65.337`     |
| `17m` | `18/17`     | `+98.955`     |
| `19m` | `19/18`     | `+93.603`     |
| `23m` | `24/23`     | `+73.681`     |
| `29m` | `261/256`   | `+33.487`     |
| `31m` | `32/31`     | `+54.964`     |
| `37m` | `37/36`     | `+47.434`     |
| `41m` | `82/81`     | `+21.242`     |
| `43m` | `129/128`   | `+13.473`     |
| `47m` | `48/47`     | `+36.448`     |
| `53m` | `54/53`     | `+32.360`     |

## Lumi's irrational bridges

A random collection of inflections to bridge from irrationals to just intonation by Lumi Pakkanen.

Reasons for existence assume `C4 = 1/1`.

| Identifier | Size in cents | Raison d'être      |
| ---------- | ------------- | ------------------ |
| `0l`       | `+0.797`      | `15/14` ~ `sm2^0l` |
| `1l`       | `+10.485`     | `11/10` ~ `sM2_1l` |
| `2l`       | `+56.843`     | `9/8`   ~ `n2^2l`  |
| `3l`       | `+1.281`      | `15/13` ~ `φ4_3l`  |
| `4l`       | `+4.018`      | `25/14` ~ `α4^4l`  |
| `5l`       | `+17.488`     |   `7/5` ~ `ζ4_5l`  |
| `6l`       | `+37.895`     | *"Third sharp"*    |
| `7l`       | `+22.737`     | *"Fifth sharp"*    |
| `8l`       | `+26.343`     | `13/7`  ~ `β4_8l`  |
| `9l`       | `+2.221`      | `21/19` ~ `sM2_9l` |

Only the [apotomic](https://en.xen.wiki/w/2187/2048) inflection `2l` ~ `sqrt(2187/2048)`, the [island](https://en.xen.wiki/w/676/675) inflection `3l` ~ `sqrt(676/675)` and the [jubilismic](https://en.xen.wiki/w/50/49) inflection `5l` ~ `sqrt(50/49)` have reasonable expressions. The rest are filler curiosities which should be revised by someone who's willing to do more research into irrational bridging.

The additional apotomic inflections `6l` and `7l` are not bridging commas, but simply fractions of the apotome only useful for notating equal temperaments where the augmented unison splits into 3 or 5 equal parts respectively. Currently no bridges exist because the stepspan of a perfect fifth is not divisible by three or five and there is no notation for fractional ordinals besides a single split.

The semiapotome `2l` is a handy companion of the neutral inflections. It's equivalent to a half-sharp, but allows for spellings that bring prime 3 more in line with the higher primes. For comparison with prime 5 we get these pairs of small and large intervals centered on the neutrals.

| Small   | Fraction   | Large   | Fraction  |
| ------- | ---------- | ------- | --------- |
| `n2_2l` | `256/243`  | `n2^2l` | `9/8`     |
| `n2_5n` | `16/15`    | `n2^5n` | `10/9`    |
| `n3_2l` | `32/27`    | `n3^2l` | `81/64`   |
| `n3_5n` | `6/5`      | `n3^5n` | `5/4`     |
| `n4_2l` | `4/3`      | `n4^2l` | `729/512` |
| `n4_5n` | `27/20`    | `n4^5n` | `45/32`   |
| `n5_2l` | `1024/729` | `n5^2l` | `3/2`     |
| `n5_5n` | `64/45`    | `n5^5n` | `40/27`   |
| `n6_2l` | `128/81`   | `n6^2l` | `27/16`   |
| `n6_5n` | `8/5`      | `n6^5n` | `5/3`     |
| `n7_2l` | `16/9`     | `n7^2l` | `243/128` |
| `n7_5n` | `9/5`      | `n7^5n` | `15/8`    |

If for some reason you find this concept appealing the vocalized names of intervals should follow [Color notation](https://en.xen.wiki/w/Color_notation) but in place of *white* we have *microwave* for the smaller intervals and *x-ray* for the larger ones. So `4/3` is a *'microwave-fourth'*, *'mu-fourth'* or *'µ4'* while `3/2` is an *'x-ray-fifth'*, *'ex-fifth'* or *'x5'*.
