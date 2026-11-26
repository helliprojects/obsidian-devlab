const {Plugin,Notice}=require('obsidian');
module.exports=class extends Plugin {
 onload(){this.addCommand({id:'ping',name:'DevLab ping',callback:()=>new Notice('DEVLAB_PONG')});}
};
