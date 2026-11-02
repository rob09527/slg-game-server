'use strict'
const moment = require('moment');
const coolingRedis = require('../../../../util/coolingRedis');

// 获取封地信息
module.exports = exports = async ctx => {
    let items = [];
    let { CONFIG, HOME, UP_BUILDING, BUILD_MAX } = global.gameconfig.newmanor;
    if (!ctx.manor) {
        ctx.manor = new ctx.dao.newmanor({ rid: ctx.role._id });
        // 首次赠送粮草
        let { FIRST_SEND: first_send = 0 } = CONFIG;
        items.push({ gsid: 38007, count: first_send });
        if (first_send) ctx.role.addItemsNoSave(items);
        const manorConfig = UP_BUILDING[1].INFO[0];
        if (manorConfig.UN_LOCK) { // 解锁 0 级解锁的建筑
            const unlock = manorConfig.UN_LOCK.filter(id => +id !== 1);
            if (unlock.length > 0) {
                let buildings = await ctx.manor.addBuilding(unlock);
                ctx.manor.building = buildings;
                ctx.manor.markModified('building')
            }
        }
        // 生成野怪信息
        let { monsters, bossinfo } = ctx.dao.newmanor.createMonster(1);
        ctx.manor.monsters = monsters;
        ctx.manor.bossinfo = bossinfo;
        ctx.manor.markModified('monsters');
        ctx.manor.markModified('bossinfo');
        await ctx.manor.save();
        ctx.manor = await ctx.dao.newmanor.findOne({ rid: ctx.role._id });
    }

    // 自动恢复粮草,玩家达到配置表拥有的上限不恢复
    let item = {};
    item.gsid = 38007;
    let recoveryhour = CONFIG.RENEW_TIMES;
    let recoverycount = CONFIG.RENEW_COUNT;
    let f_count = 0;

    f_count = Math.floor((Date.now() - ctx.manor.lastgain) / (recoveryhour * 3600 * 1000));
    f_count *= recoverycount; // 每两小时恢复数量

    if (f_count > 0) {
        if (ctx.role.getProp(38007) < CONFIG.FOOD_MAX) {
            item.count = ctx.role.getProp(38007) + f_count >= CONFIG.FOOD_MAX ? CONFIG.FOOD_MAX - ctx.role.getProp(38007) : f_count;
            if (item.count > 0) {
                items.push(item);
                ctx.role.addItemsNoSave(item);
                if (ctx.role.getProp(38007) + f_count >= CONFIG.FOOD_MAX) {
                    // 如果他领取的已经达到上限了,则记录当前时间
                    ctx.manor.lastgain = Date.now();
                } else {
                    ctx.manor.lastgain += f_count / recoverycount * recoveryhour * 3600 * 1000;
                }
                ctx.manor.markModified('lastgain');
                await ctx.manor.save();
            }
        }
    }
    await ctx.role.save();
    let manor_info = await ctx.manor.base();
    let buildings;
    if (manor_info && manor_info.buildinglist) buildings = manor_info.buildinglist;
    // 粮草满了，则不返回倒计时,未满则返回下一点粮草的恢复时间
    let nextfoodtime;
    if (ctx.role.getProp(38007) + f_count < CONFIG.FOOD_MAX) {
        nextfoodtime = ctx.manor.lastgain + 1 * recoveryhour * 3600 * 1000;
    }
    ctx.body = {
        list: buildings,
        items,
        manorlv: ctx.manor.mlv(),
        cooling: await coolingRedis(ctx.role.rid, 'getall'),
        nextfoodtime
    }

}
