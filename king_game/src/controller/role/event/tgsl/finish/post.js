
'use strict'
// 天工试炼战斗结束
module.exports = exports = async function (ctx, next) {
    let { TGSL: { MARK, SPACE: space, REWARD: rewards } } = global.gameconfig.zhd
    ctx.assert(ctx.role.getItems(MARK).count === 0, 'already finish')
    let { battleid } = ctx.request.body
    let battle = await ctx.dao.c_battle.findOne({ _id: battleid })
    ctx.assert(battle, 'invalid battleid')
    await battle.cal()

    let { result } = battle;
    let rewardindex = space.map((each, index) => {
        if (result.rlosthp >= each[0] && result.rlosthp <= each[1]) {
            return index
        }
    }).filter(x => x != undefined).shift()
    rewardindex = rewardindex === undefined ? rewards.length - 1 : rewardindex
    let reward = rewards[rewardindex]
    ctx.role.addItemsNoSave({ GSID: MARK, COUNT: 1 })
    ctx.role.addItemsNoSave(reward)
    await ctx.role.save()
    ctx.body = { reward, result, damge: result.rlosthp }
    // 周活动日志-天公试炼-挑战记录
    ctx.zhdprint("tgsl_battle", result.rlosthp, reward.map(({GSID,COUNT}) => `${GSID} ${COUNT}`).join(" "));
}