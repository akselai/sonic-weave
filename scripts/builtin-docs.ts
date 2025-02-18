import {stdout} from 'process';
import {getSourceVisitor} from '../src/parser';
import {SonicWeaveFunction} from '../src/builtin';

const visitor = getSourceVisitor();

stdout.write('# SonicWeave standard library\n');
stdout.write(
  '<!-- This file has been auto-generated by scripts/builtin-docs.ts !-->\n'
);

const builtins: SonicWeaveFunction[] = [];
const prelude: SonicWeaveFunction[] = [];

for (const riff of visitor.immutables.values()) {
  if (typeof riff === 'function') {
    const node = riff.__node__;
    if (node.type === 'FunctionDeclaration' && !node.body.length) {
      builtins.push(riff);
    } else {
      prelude.push(riff);
    }
  }
}

const int = visitor.immutables.get('int') as SonicWeaveFunction;
const dummy = () => null;
Object.defineProperty(dummy, 'name', {value: 'int', enumerable: false});
dummy.__node__ = int.__node__;
dummy.__doc__ = int.__doc__;
builtins.push(dummy);

function generateDocs(riffs: SonicWeaveFunction[]) {
  riffs.sort((a, b) =>
    a.name.localeCompare(b.name, 'en', {sensitivity: 'base'})
  );
  for (const riff of riffs) {
    const node = riff.__node__;
    stdout.write('### ' + riff.name + '\n');
    stdout.write(riff.__doc__ + '\n');
    if (node.parameters.identifiers.length || node.parameters.rest) {
      stdout.write('#### Parameters:\n\n');
      const names = node.parameters.identifiers.map(p => '`' + p.id + '`');
      if (node.parameters.rest) {
        names.push('`...' + node.parameters.rest.id + '`');
      }
      stdout.write(names.join(', ') + '\n\n');
    } else {
      stdout.write('_(No parameters)_\n\n');
    }
  }
}

stdout.write('## Built-in functions\n');
generateDocs(builtins);

stdout.write('## Prelude functions\n');
generateDocs(prelude);
