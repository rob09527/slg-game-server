"use strict"

// 领取战令等级奖励或战令任务奖励
module.exports = async function (ctx, next) {
    const {
        type = 0, // 1-战令等级奖励 2-战令任务奖励
        level, // 领取战令等级奖励的等级
        mark, // 领取战令任务奖励的任务标记
    } = ctx.request.body;
    let reward = [];
    if (type == 1) {
        const { WDMARK } = global.gameconfig.warorder;
        const { buytime = 0 } = ctx.war.charge;
        const { get } = ctx.war.levelbuy;
        let currentLevel = Math.trunc(ctx.role.getProp(WDMARK) / get) + 1;
        let isHaveReard = false;
        ctx.war.wdlevel.forEach((item,index)=> {
            if(currentLevel >= item.level){
                const { nget = 0, hget = 0 } = item;
                // 是否可领取进阶奖励
                const isHGet = buytime > 0 && hget == 0;
                if(nget == 0 || isHGet){
                    isHaveReard = true;
                    if (nget == 0) {
                        reward.push(...item.nrw);
                        item.nget = 2;
                    };
                    if (isHGet) {
                        reward.push(...item.hrw);
                        item.hget = 2;
                    };
                    ctx.war.wdlevel[index] = item;
                }
            }
        });
        if(reward.length > 0) ctx.role.addItemsNoSave(reward);
        ctx.assert(isHaveReard, "no have reward");
        ctx.war.markModified("wdlevel");
        await ctx.war.save()
    } else {
        let isHaveReard = false;
        ctx.tasks.forEach((task)=>{
            const {MARK,TYPE} = task;
            if(TYPE == type - 1){
                const count = ctx.role.getProp(MARK);
                if(count == task.NUM ){
                    isHaveReard = true;
                    ctx.role.addItemsNoSave([
                        ...task.REWARD,
                        { GSID: MARK, COUNT: 1 },
                    ]);
                    reward.push(...task.REWARD);
                }
            }
        })
        ctx.assert(isHaveReard, "no have reward");
    }
    await ctx.role.save();
    ctx.body = reward;
    ctx.zhdpoint("WARORDER_RED", ctx.role,ctx.war);
}