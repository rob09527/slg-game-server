'use strict'

// 元宵灯会
module.exports = exports = async function (ctx, next) {

    ctx.hook.pre(EVENT_ENUM.NEW_YEARS);
    
    ctx.assert(global.gameconfig.zhd.YXDH,'invalid yccb config');
    let [start, end] = global.config.ZHD.YXDH || {};
    ctx.assert(Date.in(start, end), 'fn freeze');
    ctx.config = global.gameconfig.zhd.YXDH;
    if(!ctx.role.yxdh || (ctx.role.yxdh && Object.keys(ctx.role.yxdh).length == 0)){
        //初始化5个灯谜 0//未点亮 1 已经点亮
        ctx.role.yxdh = Array.from({length:5},()=>{
            return 0;
        })
        ctx.role.markModified('yxdh');
        await ctx.role.save();
    }
    await next();
}