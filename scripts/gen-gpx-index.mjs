import { promises as fs } from 'fs';
import { join } from 'path';

const ROOT = 'public/routes';
const persons = ['suzuki','kato','shen','takase','shiotani'];

const list = [];
for (const p of persons) {
  const dir = join(ROOT, p);
  const files = await fs.readdir(dir);
  for (const f of files.filter(x=>x.toLowerCase().endsWith('.gpx'))) {
    const m = f.match(/Log(\d{8})-/);
    if (!m) continue;
    const mmdd = m[1].slice(4);
    list.push({
      file: `${p}/${f}`,
      person: p,
      mmdd,
      url: `/routes/${p}/${f}`
    });
  }
}

await fs.writeFile(join(ROOT,'index.json'), JSON.stringify(list, null, 2));
console.log(`index.json written (${list.length} GPX)`);
