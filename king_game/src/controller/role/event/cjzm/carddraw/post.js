"use strict"

const { forEach } = require("lodash")
const weighted_util = require("../../../../../util/weighted_util")

module.exports = async function (ctx, next) {
    let { multiple } = ctx.request.body
    ctx.assert(multiple <= 3 && multiple >= 1, "invalid multiple")
    await ctx.role.cjzminfo(ctx)
    let cjzm = ctx.role.cjzm
    if (cjzm.docount > 1 && multiple != cjzm.multiple) {
        ctx.assert(false, "Unable to adjust card draw rate")
    }
    //记录倍率
    ctx.role.cjzm.multiple = multiple
    //次数+1
    //根据倍数和抽取次数消耗道具
    let castitem = global.gameconfig.cjzm[5][cjzm.multiple]['items'][cjzm.docount]
    ctx.role.castItemsNoSave(castitem);
    //根据品质 星级 确定权重 最后随机一个 然后添加
    let item = randitem(ctx.role.cjzm)
    ctx.role.addItemsNoSave(item);
    ctx.role.cjzm.docount += 1
    await ctx.role.save()
    await ctx.dao.role.updateOne({ _id: ctx.role.rid }, { $set: { cjzm: ctx.role.cjzm } })
    ctx.body = item
}


function randitem(cjzm) {
    //1 2 索引是config下标
    let list = []
    //找出原始配置
    cjzm.showitem.forEach((i, index) => {
        let find = false
        for (let x = 1; x <= 2; x++) {
            global.gameconfig.cjzm[x].forEach(e => {
                if (e.GSID == i.gsid && !find) {
                    let copyinfo = JSON.parse(JSON.stringify(e))
                    if (cjzm.receiveItem[index].count != 0) {
                        copyinfo.CHANCE = -1
                    }
                    find = true
                    list.push(copyinfo)
                }
            })
        }
    })

    //根据规则找出原始配置对应的权重
    //检查一下配置随机是否异常
    let ecjc = true
    list.map(x => {
        global.gameconfig.cjzm[4].forEach(e => {
            //x.CHANCE<=0 已经领取了。不参与权重随机
            if (e.QUALITY == x.QUALITY && e.STAR == x.STAR && x.CHANCE > 0) {
                ecjc = false
                x.CHANCE = e.CHANCE
            }
        })
    })
    let itemlist = weighted_util(list, 1, "CHANCE", false)
    let index
    list.forEach((x, i) => {
        if (x.GSID == itemlist[0].GSID) {
            index = i
        }
    })

    if (ecjc) {
        console.error('超级招募配置异常', list, global.gameconfig.cjzm[4], cjzm)
        throw ('超级招募配置异常')
    }
    cjzm.receiveItem[index].count = cjzm.showitem[index].count * cjzm.multiple
    console.log("超级招募获得内容", cjzm.showitem[index], cjzm.receiveItem[index], cjzm.multiple, index)
    return cjzm.receiveItem[index];

}