import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
const root=process.env.DEVLAB_ROOT||process.cwd();
const settings=JSON.parse(readFileSync(path.join(root,'.devlab-runtime','config.json'),'utf8'));
const report=settings.report;
mkdirSync(report,{recursive:true});
let sequence=0;
export const config={
 runner:'local',framework:'mocha',maxInstances:1,
 specs:[path.join(settings.specs,'**','*.e2e.mjs')],
 capabilities:[{browserName:'obsidian',browserVersion:settings.version,'wdio:obsidianOptions':{installerVersion:'latest',plugins:[settings.plugin],vault:settings.vault,copy:false}}],
 services:['obsidian'],
 reporters:['spec',['junit',{outputDir:report,outputFileFormat:({cid})=>'junit-'+cid+'.xml'}]],
 cacheDir:path.join(root,'.obsidian-cache'),
 logLevel:'warn',outputDir:path.join(report,'logs'),
 waitforTimeout:15000,connectionRetryTimeout:120000,connectionRetryCount:1,
 mochaOpts:{ui:'bdd',timeout:90000},
 before:async()=>{
  await browser.setWindowSize(1440,1000);
  await browser.execute(()=>{
    window.__devlabErrors=[];
    window.addEventListener('error',e=>window.__devlabErrors.push(String(e.message)));
    window.addEventListener('unhandledrejection',e=>window.__devlabErrors.push(String(e.reason)));
  });
  writeFileSync(path.join(report,'runtime.json'),JSON.stringify({appVersion:await browser.getObsidianVersion(),installerVersion:await browser.getObsidianInstallerVersion(),plugin:settings.id},null,2));
 },
 afterTest:async(test,context,result)=>{
  const name=String(++sequence).padStart(2,'0')+'-'+test.title.replace(/[^a-zA-Z0-9_-]+/g,'-').slice(0,90);
  const failures=[];
  try{await browser.saveScreenshot(path.join(report,name+'.png'));}catch(e){failures.push(String(e));}
  try{writeFileSync(path.join(report,name+'.html'),await browser.getPageSource());}catch(e){failures.push(String(e));}
  try{const errors=await browser.execute(()=>window.__devlabErrors||[]);writeFileSync(path.join(report,name+'-errors.json'),JSON.stringify(errors,null,2));}catch(e){failures.push(String(e));}
  writeFileSync(path.join(report,name+'.json'),JSON.stringify({title:test.title,passed:result.passed,duration:result.duration,error:result.error?.message,diagnosticFailures:failures},null,2));
 }
};
