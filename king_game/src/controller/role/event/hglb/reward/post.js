'use strict'

module.exports = async function(ctx, next) {
    let {index} = ctx.request.body;
    index = parseInt(index) || 0;
    let info = ctx.config.PROCESS[index];
    ctx.assert(info,"invalid info"+index);
    ctx.assert(ctx.role.getProp(ctx.config.MARK) >= info.SCORE && ctx.role.getProp(info.PMARK) == 0, 'can not get');
    let reward = info.ITEMS.arrange();
    ctx.role.addItemsNoSave([...reward,{GSID:info.PMARK, COUNT:1}]);
    ctx.body = {reward};
    ctx.save = true;
}