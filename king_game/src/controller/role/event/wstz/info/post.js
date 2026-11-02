"use strict"

// 所有 boos 信息查询
module.exports = async function (ctx, next) {
    const { bossid = -1 } = ctx.request.body // -1 则获取全部 boos 信息
    const { BOSSES } = global.gameconfig.zhd.WSTZ
    const result = []
    for (let { NAME: name, BOSSID: id, GSID: gsid, CLIMIT, RANKREWARD, DAYREWARD, COST: cost, BUFF } of BOSSES) {
        if(bossid != -1 && bossid != id) continue
        let buff = [];
        let wstz = await global.dao.wstz.findOne({ rid: ctx.role.i(), bossid: id });
        if (!wstz) {
            // 首次随机生成buff
            const RANDOMNUM = BUFF.length
            for (let i = 0; i < RANDOMNUM; i++) {
                let tmpBuff = BUFF[i]
                const rate = tmpBuff.deepMap("WEIGH")
                let index = ctx.random.inweight(rate)
                buff.push(tmpBuff[index].ID)
            }
            buff = buff.map(id => ({ id }))
            wstz = new global.dao.wstz({
                rid: ctx.role.i(),
                bossid: id,
                lcards: buff,
            })
            await wstz.save()
        }
        let { myrankindex, maxdamage = 0 } = await ctx.commonsend("/activityinfo/wstz/myrank", {
            servid: ctx.role.servid,
            rid: ctx.role.i(),
            bossid: id,
        })
        const bset = global.gameconfig.battlewstzboss[id]
        ctx.assert(bset, "bset nexists")
        const data = {
            name, id, gsid,
            limit: CLIMIT,                                      // 总挑战次数
            remain: Math.max(CLIMIT - wstz.dailycount, 0),      // 剩余挑战次数
            dailydamage: wstz.dailydamage,                      // 今日累计伤害
            bset,                                               // boss 阵容
            cost,                                               // 挑战一次 boss 所消耗道具
        }
        // 每日奖励
        data.myreward = DAYREWARD.map(({ DAMAGE: damage, REWARD: reward }, i) => ({
            reward, damage,
            status: wstz.dailyrecord[i] ? 2 : wstz.dailydamage >= damage ? 1 : 0,
        }))
        if (myrankindex >= 0) {
            let myrank = myrankindex + 1
            const rewardIndex = RANKREWARD.findIndex(({ RANK }) => {
                let [min, max] = RANK
                if(!max) max = min
                return myrank >= min && myrank <= max
            })
            if (rewardIndex >= 0) {
                data.myrank = myrank                            // 我的排名
                data.maxdamage = maxdamage                      // 我的最高伤害
            }
        }
        data.buff = wstz.lcards
        result.push(data)
    }
    ctx.body = result
}