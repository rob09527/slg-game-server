'use strict'

module.exports = exports = async (ctx, next) =>{
    let battle = await ctx.dao.c_battle.findOne({_id: ctx.request.body.battleid});
	// 战斗计算
	ctx.assert(battle, 'invalid battleid');

    await battle.cal();
    ctx.body = {result: battle.result};
    ctx.body.result.reward = [];
    if (battle.result.ret == 'win') {
        ctx.config.REWARD[ctx.qxzl.pos].forEach(({GSID, COUNT, RATE})=>{
            if (RATE == 100 || Math.random() * 100 <= RATE) {
                ctx.body.result.reward.push({GSID, COUNT});
            }
        });
        ctx.role.addItemsNoSave(ctx.body.result.reward);
        await ctx.role.save();

        if (ctx.qxzl.type == 1) {
            ctx.qxzl.val--;
        }
        ctx.qxzl.pos++;
        ctx.qxzl.save();
    }
}