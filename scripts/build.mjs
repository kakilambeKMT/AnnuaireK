import {build} from 'esbuild';import {execFileSync} from 'node:child_process';import fs from 'node:fs';
await build({entryPoints:['app/auth-source.js'],outfile:'app/auth.js',bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true});
execFileSync(process.execPath,['scripts/build-static.mjs'],{stdio:'inherit'});
const html=fs.readFileSync('public/index.html','utf8');if(/signin-with-chatgpt|chatgpt\.site/.test(html+fs.readFileSync('public/platform.js','utf8')))throw new Error('Une ancienne dépendance Sites subsiste');
console.log('Netlify : interface, PWA et authentification compilées. Fonctions et migrations présentes dans netlify/.');
