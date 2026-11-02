'use strict'
// 迎春筹办
module.exports = exports = async function (ctx, next) {
    ctx.hook.pre(EVENT_ENUM.NEW_YEARS)
    ctx.assert(global.gameconfig.zhd.YCCB,'invalid yccb config');
    let [start, end] = global.config.ZHD.YCCB || {};
    ctx.assert(Date.in(start, end), 'fn freeze');
    ctx.config = global.gameconfig.zhd.YCCB;
    if(!ctx.role.yccb || (ctx.role.yccb && Object.keys(ctx.role.yccb).length == 0)){
        //初始化一个16长度的拼图 每个拼图初始状态为0      1 已经点击 
        let {FRAG_LIST_INIT_COUNT} = ctx.config;
        let pictures = Array.from({length:FRAG_LIST_INIT_COUNT},()=>{
            return 0;
        }) 
        // 前四个对应行奖励  后四个对应列奖励 最后一列是终极奖励  状态 0:未达到领取条件 1 未领取 2 已领取
        let taskProcess = Array.from({length:9},()=>{
            return 0;
        })
        //默认第一关
        let limit = 1;
        ctx.role.yccb = {
            pictures,
            limit,
            taskProcess,
            bigReward:[]
        };
        ctx.role.markModified('yccb');
        await ctx.role.save();
    }
    await next();
}