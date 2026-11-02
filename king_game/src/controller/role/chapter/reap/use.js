'use strict'

/**
 * 新增快速收益，快战玩法逻辑
 * @author awko
 * @type {exports}
 */
module.exports = exports = async (ctx, next) => {
    const {hour, AD} = ctx.request.body;
    ctx.isKZ = false; // 是否是快战逻辑
    if (AD) {
        ctx.assert(ctx.role.getProp(90738) < global.gameconfig.commonPeiZhi[1011][0][0],'times limit');
        ctx.reaptime = (2 * 3600 * 1000);
        ctx.ad = AD;
        ctx.backlastreap = ctx.role.lastreap;
    }
    else if (hour && hour > 0) {

        if (+hour === 2){ // 快战逻辑,也就是快速收益2小时
            ctx.hook.pre(EVENT_ENUM.WORLD_QUICK);
            const limit = gameconfig.vip.KZ_LIMIT[ctx.role.vip] + ctx.role.getProp(90671);
            let nowTimes = ctx.role.getProp(90165);
            if (nowTimes > 0 && ctx.role.special.mopup) {
                if (ctx.role.getProp(90670)) {
                    nowTimes = 0;
                    ctx.role.castItemsNoSave({GSID:90670, COUNT:1});
                }
                else if (ctx.role.getProp(90693)) {
                    nowTimes -= ctx.role.getProp(90693);
                }
            }
            ctx.assert( nowTimes < limit , 'times limit');
            ctx.castitems =  gameconfig.vip.KZ_CAST[nowTimes];
            if(ctx.castitems && ctx.castitems.length > 0){
                // 快速收益消耗
                ctx.role.castItemsNoSave(ctx.castitems, {main: 'chapter', sec: 'kaizan'});
            }
            ctx.isKZ = true;
            await global.dao.warorder.point(ctx.role, 90570);  // 卧龙战令-快速挂机
        }
        else if (global.config.GANGER_NO_ORDER !== true){
            // 非测试环境不能 随意快速征收
            assert.fail('UNKNOW HOURE');
        }

        ctx.reaptime = (hour * 3600 * 1000);
        ctx.backlastreap = ctx.role.lastreap;
        console.log('REAP TIME SET', ctx.reaptime, ctx.role.uid, ctx.role.rno)
    } else {
        const maxTime = global.gameconfig.vip.HANG.TIME_HOUR[ctx.role.vip] * 60 * 60 * 1000 ;
        ctx.reaptime = Math.min(Date.now() - ctx.role.lastreap, maxTime);
        let firsttime = ctx.role.getItems(90213).count;
        if(firsttime > 0){ //秒
            ctx.reaptime = firsttime * 1000;
            ctx.role.castItemsNoSave({GSID: 90213, COUNT: firsttime});
        }
    }

    await next();
}
