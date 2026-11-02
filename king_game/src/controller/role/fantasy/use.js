
'use strict'

/**
 *  奇门幻阵
 * @param {*} ctx 
 * @param {*} next 
 */
module.exports = async (ctx, next) => {
    // 是否解锁功能
    ctx.hook.pre(EVENT_ENUM.FANTASY);

    // 活动记录
    let bossDbs = await global.dao.fantasy.findOne();
    assert(bossDbs, 'not deploy boss');
    ctx.bossConfig = bossDbs.base();

    const uidStr = ctx.role.i();
    ctx.record = await global.dao.fantasyboss.findOne({
        rid: uidStr
    })
    if (!ctx.record) {
        let selfGroup = await global.dao.topkingservergroup.findOne({ servid: ctx.role.servid });
        // 增加一个默认跨服组(处理不在跨服组内的区服，相同区服编号的在一起排名)
        if (!selfGroup) {
            const { area } = ctx.role._gameserv;
            selfGroup = { areamark: 'default'+ (area?.id||'') };
        }

        ctx.record = await global.dao.fantasyboss.create({
            areamark: selfGroup.areamark,
            rid: uidStr,
            servid: ctx.role.servid,
            bossid: ctx.bossConfig.bossid
        });
    }

    ctx.areamark = ctx.record.areamark;
    ctx.fantasyRank = new global.services.RankService('fantasy', ctx.record.areamark);
    const { CONFIG: config } = global.gameconfig.fantasy;
    let battleNum = ctx.role.getProp(98001); // 挑战次数
    let resetNum = ctx.role.getProp(98005); // 重置次数
    // 剩余次数
    ctx.surplusNum = config.FREE + (config.FREE * resetNum) - battleNum;

    await next();
}