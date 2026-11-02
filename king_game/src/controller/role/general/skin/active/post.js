
'use strict'
const ms = require('ms');
// 武将皮肤激活
module.exports = exports = async (ctx, next) => {
    let { skinid } = ctx.request.body;
    ctx.assert(skinid, 'invalid skinid');
    let config = global.gameconfig.generalskin[skinid]
    let { CAST: cast = [], TIMELIMIT: timelimit = -1, HEADID: headid = 0,IMAGEID:imageid=0 } = config;
    let { TIMELIMIT: head_timelimit=0 } = global.gameconfig.heads[headid] || {};
    let { TIMELIMIT: image_timelimit=0 } = global.gameconfig.images[imageid] || {};
    ctx.assert(config, 'invalid skin config');
    // 判断是否满足激活条件
    let flag = false;
    for (let item of cast) {
        let num = ctx.role.getProp(item.GSID);
        if (num < item.COUNT) {
            flag = true;
            break;
        }
    }
    ctx.assert(!flag, 'no enough');
    // 扣除道具
    if (cast.length > 0) ctx.role.castItemsNoSave(cast);
    console.log('ctx.role._skins', ctx.role._skins)
    ctx.role._skins[skinid] = timelimit == -1 ? -1 : Date.now() + ms(timelimit + 'd');
    // 如果有头像则添加到头像框里面
    if (head_timelimit && !ctx.role._heads[headid]) {
        ctx.role._heads[headid] = head_timelimit;
        ctx.role.markModified('_heads');
    }
    // 有形象则添加到形象列表里
    if (image_timelimit && !ctx.role._images[imageid]) {
        ctx.role._images[imageid] = image_timelimit;
        ctx.role.markModified('_images');
    }
    ctx.role.markModified('_skins');
    await ctx.role.save();

    ctx.body = {
        castitems: cast
    }
    ctx.general = null;// 不用保存
}
