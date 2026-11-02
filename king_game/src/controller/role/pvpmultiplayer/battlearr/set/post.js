
'use strict'

// pvp3vs3 阵容保存
module.exports = exports = async (ctx, next) => {
    let { index, battleset, type } = ctx.request.body
    let name = ''
    let checklist = []
    if (type == 'attack' && index <= 3 && index >= 1) {
        name = "attack".concat(index)
        checklist = ['attack1', 'attack2', 'attack3']
    } else if (type == 'defense' && index <= 3 && index >= 1) {
        index = index
        name = "defense".concat(index)
        checklist = ['defense1', 'defense2', 'defense3']
    } else {
        ctx.assert(false, "index error")
        return
    }
    console.log("id", index)
    // let pre = ctx.role.battlearr[name]
    // if (ctx.tname) { // 只修改预设阵容名字
    //     ctx.assert(pre, "battleset nexist")
    //     pre.tname = ctx.tname
    //     ctx.role.markModified('battlearr');
    //     await ctx.role.save()
    //     ctx.body = {}
    //     return
    // }
    // 更新或者新增预设阵容
    let diff = 0 // 设置的预设阵容不能跟之前设置的任意一个一样
    let bsTeamLen = Object.keys(battleset.team).length
    for (let i = 0; i < checklist.length; i++) {
        let cur = ctx.role.battlearr[checklist[i]] ? ctx.role.battlearr[checklist[i]] : { team: [] }
        if (cur.mythic != battleset.mythic) {
            diff += 1
            continue
        }
        if (Object.keys(cur.team).length != bsTeamLen) {
            diff += 1
            continue
        }
        for (let key in cur.team) {
            if (cur.team[key] != battleset.team[key]) {
                diff += 1
                break
            }
            if (i + 1 != index && cur.team[key] == battleset.team[key]) {
                ctx.assert(diff === checklist.length, `error-repeat:key:-${key}-index:${i + 1}`)
            }

        }
    }
    ctx.assert(diff === checklist.length, "battleset same")
    await ctx.role.setBattleSet(name, battleset)
    ctx.body = {}
}