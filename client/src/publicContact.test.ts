import {readFileSync} from 'node:fs';
import {it,expect} from 'vitest';
it('uses the established public contact',()=>{const source=readFileSync(new URL('./App.tsx',import.meta.url),'utf8');expect(source).toContain('mailto:apply@hsndm.tech');expect(source).not.toContain('mailto:support@hsndm.tech');});
