
'use strict'

const secretTask = require("../../../../../../model/secretRealmRole/instance/secretTask")

// 预设阵容设置
module.exports = exports = async (ctx, next) => {
    let name = "pre".concat(ctx.index)
    if (ctx.index == 0) {
        name = "normal"
    }
    console.log("id", ctx.index)
    let pre = ctx.role.battlearr[name]
    if (ctx.tname) { // 只修改预设阵容名字
        ctx.assert(pre, "battleset nexist")
        pre.tname = ctx.tname
        ctx.role.markModified('battlearr');
        await ctx.role.save()
        ctx.body = {}
        return
    }
    // 更新或者新增预设阵容
    let diff = 0 // 设置的预设阵容不能跟之前设置的任意一个一样
    let bsTeamLen = Object.keys(ctx.bs.team).length
    for (let i = 0; i < ctx.preNames.length; i++) {
        let cur = ctx.role.battlearr[ctx.preNames[i]]
        if (cur.mythic != ctx.bs.mythic) {
            diff += 1
            continue
        }
        if (Object.keys(cur.team).length != bsTeamLen) {
            diff += 1
            continue
        }
        for (let key in cur.team) {
            if (cur.team[key] != ctx.bs.team[key]) {
                diff += 1
                break
            }
        }
    }
    ctx.assert(diff === ctx.preNames.length, "battleset same")

    if (pre || ctx.index == 0) { // 更新阵容
        console.log(ctx.role.uid)
        await ctx.role.setBattleSet(name, ctx.bs)
    } else { // 新增阵容,不对前端传过来的index做判断，根据最后一个阵容的index自增一个新阵容
        await ctx.role.setBattleSet("pre".concat(ctx.preNames.length + 1), ctx.bs)
    }
    await secretTask(ctx, 99662, 1)
    ctx.body = {}
}