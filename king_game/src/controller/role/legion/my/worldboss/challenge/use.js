'use strict'
const wbossconfig = global.gameconfig.legionwboss;

module.exports = exports = async (ctx, next) => {
    //获得季节
    let {season} = ctx.bseason();
    // 获得当前季节的boss
    let wbossInfo = wbossconfig.BOSS_INFO[season];
    ctx.legionwboss = await ctx.dao.legionwboss.findOne({
        servid: ctx.role.servid,
        rid: ctx.role.i(),
        legion: ctx.role.legion
    });
    if (!ctx.legionwboss) ctx.legionwboss = new ctx.dao.legionwboss({
        servid: ctx.role.servid, rid: ctx.role.i(), legion: ctx.role.legion,lname: ctx.legion.name
    });
    // boss
    const challenge_time = ctx.role.getItems(90389).count;
    const yb_num = wbossconfig.FIGHTING_COST[challenge_time];
    ctx.assert(typeof yb_num === 'number', 'no more');
    if (yb_num > 0) ctx.role.castItemsNoSave({gsid: 38005, count: yb_num});

    await next();
    if(ctx.bossid) {
        ctx.legionwboss.bossid = ctx.bossid;
    }
    ctx.legionwboss.update = Date.now();
    ctx.legionwboss.lastdamages = ctx.current_damage;
    ctx.legionwboss.totaldamages += ctx.current_damage;

    let items = wbossInfo.FIGHT_REWARD.map(({GSID, COUNT, ADD}) => {
        return {
            GSID,
            COUNT: COUNT + ADD * ctx.role.level
        }
    });
    // 随机获得奖励次数
    let rate = wbossInfo.RANDOM_RATE.deepMap('CHANCE');
    let {NUM: randomnum} = wbossInfo.RANDOM_RATE[ctx.random.inweight(rate)];
    if (randomnum > 0) {
        for (let i = 0; i < randomnum; i++) {
            let random_reward_rate = wbossInfo.RANDOM_REWARD.deepMap('CHANCE');
            let {NUM: num} = wbossInfo.RANDOM_RATE[ctx.random.inweight(random_reward_rate)];
            if (num > 0) {
                let {GSID, COUNT} = wbossInfo.RANDOM_REWARD[num];
                items.append({GSID, COUNT});
            }
        }
    }

    // 整理格式
    items = items.arrange()
    ctx.role.addItemsNoSave(items);
    ctx.role.addItemsNoSave(90389);
    // 排行榜redis缓存增加伤害
    await ctx.legionwbossRank.inc(ctx.legion._id.toString(), ctx.current_damage);
    await ctx.legionwbossRoleRank.inc(ctx.role.i(), ctx.current_damage);

    await ctx.role.save();
    await ctx.legionwboss.save();
    ctx.body = ctx.body || {};
    ctx.body.rewards = items;
}
