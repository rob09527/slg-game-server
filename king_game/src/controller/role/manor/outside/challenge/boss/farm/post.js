'use strict'
// boss 扫荡
module.exports = exports = async ctx => {
    ctx.body = {};
    // 判断是否有挑战过
    let boss = ctx.manor.bossinfo[0];
    ctx.assert(boss.totaldamage > 0, 'challenge first');
    let { times } = ctx.request.body;
    times = parseInt(times) || 1;
    let i = 0;
    for (; i < times; i++) {
        if (boss.totaldamage >= boss.maxhp) break;
        boss.totaldamage += boss.lastdamage;
    }
    ctx.times = i;
    // 扫荡都消耗粮草
    ctx.role.castItemsNoSave({ gsid: 38007, count: i });
    // 计算挑战奖励
    let items = [];
    let kill_reward = [];// 直接返回挑战奖励
    let config = global.gameconfig.newmanor_monster[ctx.manor.monsterlv];
    ctx.assert(config, 'manor boss farm config err')
    for (let i = 0; i < ctx.times; i++) {
        let _items = config.BOSS_FIGHTING_GIFT.map(function (item) {
            return {
                GSID: item.GSID,
                COUNT: ctx.random.between(item.MIN, item.MAX)
            }
        })
        _items = _items[ctx.random.between(0, _items.length - 1)];
        items.append(_items);
    }

    ctx.body.nowhp = boss.maxhp - boss.totaldamage < 0 ? 0 : boss.maxhp - boss.totaldamage;
    boss.nowhp = ctx.body.nowhp; // 记录当前血量
    ctx.manor.bossinfo[0] = boss;

    // BOSS击杀奖励 发放
    if (boss.totaldamage >= boss.maxhp) {
        ctx.body.nowhp = 0;
        // 直接给奖励
        kill_reward.append(config.BOSS_KILL_GIFT); // 返回相应的奖励到指定字段
        if (kill_reward.length > 0) ctx.role.addItemsNoSave(kill_reward);
        boss.state = 3;
        ctx.body.kill = boss.state
        await global.dao.warorder.point(ctx.role, 90565);  // 卧龙战令-府邸扫荡
        await global.dao.warorder.point(ctx.role, 90574);  // 卧龙战令-终极任务-府邸剿匪
        // 生成新的关卡数据
        let { monsters, bossinfo, lv } = await ctx.dao.newmanor.createMonster(ctx.manor.monsterlv + 1);
        ctx.manor.monsters = monsters;
        ctx.manor.bossinfo = bossinfo;
        if (lv == ctx.manor.monsterlv + 1) {
            // 说明切关卡了,记录历史最大通关数
            ctx.role.addItemsNoSave({ gsid: 97054, count: 1 });
            // 排名保存redis
            let rankService = new global.services.RankService('manor', ctx.role._gameserv.groupid);
            await rankService.set({
                id: ctx.role.i(),
                score: ctx.manor.monsterlv
            });
        }
        ctx.manor.monsterlv = lv;
        ctx.manor.markModified('monsterlv');
        ctx.manor.markModified('monsters');
    }
    items = items.arrange();
    ctx.role.addItemsNoSave(items);

    ctx.body.items = [...items, ...kill_reward.map(o => ({ ...o, kill: 1 }))];
    ctx.manor.markModified('bossinfo');
    await ctx.manor.save();
    await ctx.role.save();
}
