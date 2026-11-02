
'use strict'

module.exports = exports = async (ctx, next) =>{
	// 检查缓存是否存在
	ctx.assert(ctx.dginfo, 'setg first');
    let rebirth = ctx.dginfo.rebirth || 0;
	ctx.assert(rebirth < 1, 'already rebirth');
    ctx.body = {};
    let config = global.gameconfig.commonPeiZhi;
    ctx.assert(config && config['1009'],'invalid config');
    for (let guid in ctx.dginfo.generals) {
        let general = ctx.dginfo.generals[guid];
        if (config['1009'][0].includes(general.gsid) && general.hppercent == 0) {
            general.hppercent = 10000;
            general.rebirth = true;
            ctx.body[guid] = general.hppercent;
            ctx.dginfo.markModified('generals.'+guid);
        }
    }
    ctx.assert(Object.keys(ctx.body).length,'no general');
    rebirth++;
    ctx.dginfo.rebirth = rebirth;
    // 保存数据
    await ctx.dginfo.save();
}