import {browser,$,expect} from '@wdio/globals';
describe('DevLab reference smoke test',()=>{
 it('launches Obsidian and executes the fixture plugin command',async()=>{
  await browser.executeObsidianCommand('devlab-smoke:ping');
  await expect($('.notice')).toHaveText(expect.stringContaining('DEVLAB_PONG'));
 });
});
