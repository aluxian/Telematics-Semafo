const fs = require('fs');

function parseLine(line) {
  // 2018-04-20 14:22:53.641061 @ ran INTAKE_PRESSURE in 42.189ms = 98 kilopascal
  const re = /(.+) @ ran (.+) in (.+)ms = *(.*)/g;
  const grs = re.exec(line);
  
  if (!grs) {
    throw new Error('grs is null: ' + line);
  }

  const obj = {
    ts: new Date(grs[1]),
    cmd: grs[2],
    ms: parseFloat(grs[3]),
    result: grs[4]
  };

  if (obj.result === 'None' || obj.result === 'ERR' || obj.result === '[]') {
    obj.result = null;
  }

  return obj;
}

const log = fs.readFileSync('./log.txt', 'utf8').split('\n');
const objs = log.filter(l => l.length > 0).map(parseLine);
const objs_no_null = objs.filter(o => o.result);

const cmds = Array.from(new Set(objs_no_null.map(o => o.cmd)));

function q(c) {
  return objs.filter(o=>o.cmd==c).map(o=>o.result);
}

const vbc = objs_no_null.reduce(function(acc, va) { 
  if (!Array.isArray(acc[va.cmd])) {
    acc[va.cmd] = [];
  }

  acc[va.cmd].push(va.result);
  return acc;
}, {});

const grouped = Object.entries(vbc).map(([k,v]) => k + ': ' + v.join(' '));
const grouped_str = grouped.join('\n\n');
