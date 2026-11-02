'use strict'

// 回收

module.exports = exports = async (ctx, next) => {

    let {MAX_QUALITY} = global.gameconfig.horsesetting;
    let rewards = {};
    let dels = [];

    let {ids} = ctx.request.body;
    let horses = await ctx.role.findHorses(ids);
    for(let id in horses) {
        let horse = horses[id];
        let config = global.gameconfig.horseitem[horse.gsid];
        // 没有被装配，品阶需求
        if(!horse.owner && config.QUALITY <= MAX_QUALITY) {
            // 当前品阶等级返回
            for(let j = 0; j < horse.level - 1; j++) { // 默认1级，要-1
                let items = global.gameconfig.horselvlcost[config.QUALITY][j] || {};
                for (let item of items) {
                    rewards[item.GSID] = rewards[item.GSID] || 0;
                    rewards[item.GSID] += item.COUNT;
                }
            }
            //品阶返回
            while(config.BGSID) {
                config = global.gameconfig.horseitem[config.BGSID];
                if(!config) break;
                for(let j = 0; j < config.MAXLEVEL - 1; j++) { // 默认1级，要-1
                    let items = global.gameconfig.horselvlcost[config.QUALITY][j] || {};
                    for (let item of items) {
                        rewards[item.GSID] = rewards[item.GSID] || 0;
                        rewards[item.GSID] += item.COUNT;
                    }
                }
                for (let item of global.gameconfig.horseawake[config.QUALITY-1]) {
                    rewards[item.GSID] = rewards[item.GSID] || 0;
                    rewards[item.GSID] += item.COUNT;
                }
            }

            dels.push(id);
            ctx.role.notifyGeneralCost({
                type: 'recover',
                gsid: horse.gsid,
            })
        }
    }
    let items = [];
    for (let gsid in rewards) {
        const count = rewards[gsid];
        if (count < 1) continue;
        items.push({ GSID: parseInt(gsid), COUNT: count });
    }
    const reason = {main: 'horse', sec: 'recover'};
    ctx.role.addItemsNoSave(items, reason);

    await global.dao.horse.deleteMany({_id: {$in: dels}});

    ctx.body = {
        items,
        dels
    }
}
