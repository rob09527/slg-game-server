'use strict'

const secretTask = require("../../../../../model/secretRealmRole/instance/secretTask");

module.exports = exports = async (ctx, next) => {
    let battle = await ctx.dao.c_battle.findOne({ _id: ctx.request.body.battleid });
    // 战斗计算
    ctx.assert(battle, 'invalid battleid');

    await battle.cal();
    let reward = [];
    ctx.reward.forEach(({ GSID, COUNT, RATE }) => {
        if (RATE == 100 || Math.random() * 100 <= RATE) {
            reward.push({ GSID, COUNT });
        }
    })
    ctx.body = { result: battle.result };
    if (battle.result.ret == 'win') {
        ctx.body.items = reward;
        ctx.role.addItemsNoSave([...reward, { GSID: ctx.storey, COUNT: 1 }]);
        await ctx.role.save();
        await secretTask(ctx, 99660, 1)
    }
    ctx.body.mjxw = ctx.role.getProp(ctx.storey);
}