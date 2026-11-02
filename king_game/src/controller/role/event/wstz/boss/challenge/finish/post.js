"use strict"

// 战斗结束
module.exports = async function (ctx, next) {
    let { battleid } = ctx.request.body;
    let battle = await ctx.dao.c_battle.findOne({ _id: battleid })
    ctx.assert(battle, 'invalid battleid');
    await battle.cal()
    let {
        result: {
            rlosthp,
        }
    } = battle
    let video = battle.getVideoObject()
    // 插入玩家昵称
    video.left.info.rname = ctx.role.name
    video.right.info.rname = ctx.bossconfig.NAME
    // 保存伤害数据
    ctx.commonsend("/activityinfo/wstz/record", {
        servid: ctx.role.servid,
        name: ctx.role.name,
        rid: ctx.role.i(),
        level: ctx.role.level,
        headid: ctx.role.headid,
        frameid: ctx.role.frameid,
        bossid: ctx.bossid,
        maxdamage: rlosthp,
        video_str: JSON.stringify(video),
        version: battle.result.version,
    }).catch(console.error)
    const { COST, CLIMIT, CREWARD } = ctx.bossconfig
    ctx.wstz.last = Date.now()
    ctx.wstz.dailydamage += rlosthp
    // 消耗道具或免费次数
    if(ctx.wstz.dailycount >= CLIMIT) {
        ctx.role.castItemsNoSave(COST)
    }
    ctx.wstz.dailycount += 1;
    // 获取随机挑战奖励
    const rate = CREWARD.deepMap("WEIGH")
    let reward = CREWARD[ctx.random.inweight(rate)]
    reward = reward.REWARD
    ctx.role.addItemsNoSave(reward)
    await ctx.wstz.save()
    await ctx.role.save()
    ctx.body = {
        result: battle.result,
        damge: rlosthp,
        reward,
    }
}