import {cp,mkdir,readFile,readdir,rm,stat,writeFile} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(process.env.DEVLAB_ROOT||process.cwd());
const inside=(p)=>{const x=path.resolve(root,p);const rel=path.relative(root,x);if(rel.startsWith('..'+path.sep)||rel==='..'||path.isAbsolute(rel))throw Error('Path outside caller: '+p);return x;};
const plugin=inside(process.env.DEVLAB_PLUGIN_PATH||'.');
const vault=inside(process.env.DEVLAB_VAULT_PATH||'test-vault');
const specs=inside(process.env.DEVLAB_SPECS_PATH||'e2e');
const runtime=inside('.devlab-runtime');
const report=inside('.devlab-reports');
const harness=path.resolve(import.meta.dirname,'..');
const targetSpecs=path.join(harness,'runtime-specs');
const manifest=JSON.parse(await readFile(path.join(plugin,'manifest.json'),'utf8'));
if(!/^[a-z0-9][a-z0-9-]*$/.test(manifest.id))throw Error('Invalid plugin ID');
if(!(await stat(path.join(plugin,'main.js'))).isFile())throw Error('main.js missing');
await rm(runtime,{recursive:true,force:true});
await rm(targetSpecs,{recursive:true,force:true});
await mkdir(runtime,{recursive:true});await mkdir(report,{recursive:true});
await cp(vault,path.join(runtime,'vault'),{recursive:true});
await cp(specs,targetSpecs,{recursive:true});
const files=await readdir(targetSpecs,{recursive:true});
if(!files.some(x=>x.endsWith('.e2e.mjs')))throw Error('No .e2e.mjs specs');
const dest=path.join(runtime,'vault','.obsidian','plugins',manifest.id);
await mkdir(dest,{recursive:true});
// Launcher installs only manifest/main/styles. Copy explicitly named runtime extras
// into the disposable vault first, not the original vault.
const extras=JSON.parse(process.env.DEVLAB_EXTRAS||'[]');
if(!Array.isArray(extras))throw Error('extras must be an array');
for(const name of extras){if(typeof name!=='string'||!/^[a-zA-Z0-9_-][a-zA-Z0-9_.-]*$/.test(name)||['manifest.json','main.js','styles.css'].includes(name))throw Error('Invalid runtime extra');await cp(path.join(plugin,name),path.join(dest,name),{recursive:true,verbatimSymlinks:true});}
await writeFile(path.join(runtime,'config.json'),JSON.stringify({plugin,vault:path.join(runtime,'vault'),specs:targetSpecs,report,id:manifest.id,version:process.env.DEVLAB_OBSIDIAN_VERSION||'latest'},null,2));
console.log('Prepared disposable vault for '+manifest.id);
