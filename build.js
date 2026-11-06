// Gera dist/index.html (página completa) e dist/artefato.html (fragmento para publicar como artefato).
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const tpl = fs.readFileSync(path.join(root, 'src/template.html'), 'utf8');
const data = fs.readFileSync(path.join(root, 'src/data.json'), 'utf8').replace(/</g, '\\u003c');
const eng = fs.readFileSync(path.join(root, 'src/engine.js'), 'utf8').replace(/<\/script/gi, '<\\/script');
const body = tpl.replace('__DATA__', () => data).replace('__ENGINE__', () => eng);
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/artefato.html'), body);
const titulo = (body.match(/<title>[\s\S]*?<\/title>/) || ['<title>Calculadora de Nível de API</title>'])[0];
const full = '<!doctype html>\n<html lang="pt-BR"><head>' + titulo + '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="color-scheme" content="light dark"></head><body>\n' + body.replace(titulo, '') + '\n</body></html>\n';
fs.writeFileSync(path.join(root, 'dist/index.html'), full);
console.log('ok', Math.round(full.length / 1024) + ' KB');
