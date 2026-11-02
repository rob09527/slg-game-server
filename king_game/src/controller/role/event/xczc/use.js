'use strict'

// 新春招财聚宝
module.exports = exports = async function (ctx, next) {
    ctx.hook.pre(EVENT_ENUM.NEW_YEARS);
    ctx.assert(global.gameconfig.zhd.XCZC,'invalid xczc config');
    let [start, end] = global.config.ZHD.XCZC || {};
    ctx.assert(Date.in(start, end), 'fn freeze');
    ctx.config = global.gameconfig.zhd.XCZC;
    if(!ctx.role.xczc || (ctx.role.xczc && Object.keys(ctx.role.xczc).length == 0)){
        //初始倍数  0 没有抽取 1 已经抽取 2 已经获得
        let {MULTIPLES} = ctx.config;
        let multiples = Array.from({length:MULTIPLES.length},()=>{
            return 0;
        })
        
        ctx.role.xczc = {
            multiples,
            freeCount:1
        };

        ctx.role.markModified('xczc');
        await ctx.role.save();
    }
    await next();
}