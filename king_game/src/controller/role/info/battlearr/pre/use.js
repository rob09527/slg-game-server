
'use strict'

const { forEach } = require("lodash")

// 预设阵容
module.exports = exports = async (ctx, next) => {
    //rob国战脚本 生产模式屏蔽。脚本释放
    // let result = await global.dao.general.find({ rid: ctx.role.rid })
    // let index = 0
    // let tname
    // let battleset = {
    //     team: { "3": result[0].id, "5": result[1].id },
    //     tname: "编队0"
    // }
    //rob国战脚本end

    let { index, battleset, tname } = ctx.request.body
    index = parseInt(index)
    ctx.index = index
    if (battleset) ctx.bs = battleset
    if (tname) ctx.tname = tname
    let preNames = Object.keys(ctx.role.battlearr)
        .filter(key => key.startsWith("pre"))
        .sort()
    ctx.preNames = preNames
    await next()
}