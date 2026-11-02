'use strict'

// 砸金蛋
module.exports = exports = async function (ctx, next) {
    ctx.assert(global.gameconfig.zhd.ZJD,'zjd config is not exists');
    let [start, end] = global.config.ZHD.ZJD || {};
    ctx.assert(Date.in(start, end), 'fn freeze');
    ctx.assert(global.gameconfig.zhd.ZJD,'ZJD Config is not exits')
    if (!ctx.role.zjd || (ctx.role.zjd && Object.keys(ctx.role.zjd).length == 0)) {
        // 初始化
        const {ZJD_LIST_INIT_COUNT} = global.gameconfig.zhd.ZJD;
        ctx.assert(ZJD_LIST_INIT_COUNT,'ZJD list count Config is not exits');

        let jdList = Array.from({length:ZJD_LIST_INIT_COUNT}).map((v,i)=>{
            return {
                status:0,//0 未解锁 1 解锁没有砸金蛋 2 奖励没有领取 3 奖励已经领取
                awardItems:[]//用来存储金蛋奖励
            }
        })
        ctx.role.zjd = {
            progress: [0,0,0,0],
            jdList
        }
    }
    await next();
}