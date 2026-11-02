
'use strict'
// 秘境宝阁
module.exports = exports = async function (ctx, next) {
    let [start, end] = global.config.ZHD.MJBG || [];
    ctx.assert(Date.in(start, end), 'fn freeze');

    // 周活动日志-秘境宝阁-楼层信息
    ctx.zhdfloor = function(count = 1) {
        if(!ctx.role.mjbg.final) return;
        let [floor, box] = ctx.role.mjbg.final.split(",");
        let hased = ctx.role.mjbg.hased || [];
        ctx.zhdprint("mjbg_floor", floor, ctx.role.mjbg.open.filter(i => i == 1).length, box, hased[floor] ? 1 : 0, count);
    }

    ctx.nextfloor = async function () {
        let current = ctx.role.mjbg.index
        let finalmark = ctx.role.mjbg.openitem[ctx.role.mjbg.openitem.length - 1]
        if(finalmark === 0) return false
        ctx.role.mjbg.index = current + 1
        ctx.role.mjbg.open = Array.from({ length: 35 }, () => 0)
        ctx.role.mjbg.openitem = Array.from({ length: 35 }, () => 0)
        ctx.role.mjbg.final = undefined
        ctx.role.markModified('mjbg.index')
        ctx.role.markModified('mjbg.open')
        ctx.role.markModified('mjbg.openitem')
        ctx.role.markModified('mjbg.final')
        return true
    }

    ctx.getreward = async function (current, ITEMS, FINALLIST, CONSUME) {
        // 历史获得的宝箱数量
        let histreward = ctx.role.mjbg.open.filter(cur => cur === 1).length
        let othersreward = []
        for (let i = 0; i < ctx.role.mjbg.openitem.length; i++) {
            if (ctx.role.mjbg.openitem[i] === 1) continue
            if (i === ctx.role.mjbg.openitem.length - 1) {
                if (ctx.role.mjbg.final && histreward > CONSUME[current].MIN) { // 前 histreward 次不给获得终极宝物
                    let [floor, box] = ctx.role.mjbg.final.split(",");
                    floor = parseInt(floor);
                    box = parseInt(box);
                    othersreward.push({ index: i, chance: FINALLIST[floor][box].CHANCE })
                }
            } else {
                othersreward.push({ index: i, chance: ITEMS[current][i].CHANCE })
            }
        }
        if (othersreward.length === 0) return false // 当前层数宝箱已抽完
        let rate = othersreward.deepMap('chance');
        let { index } = othersreward[ctx.random.inweight(rate)];
        ctx.role.mjbg.openitem[index] = 1
        ctx.role.markModified('mjbg.openitem')
        let reward = {}
        if (index === ctx.role.mjbg.openitem.length - 1) { // 终极宝物
            let [floor, box] = ctx.role.mjbg.final.split(",");
            floor = parseInt(floor);
            box = parseInt(box);
            if (!ctx.role.mjbg.hased) ctx.role.mjbg.hased = []
            ctx.role.mjbg.hased.push(ctx.role.mjbg.final)
            ctx.role.markModified('mjbg.hased')
            reward = FINALLIST[floor][box];
        } else { // 普通宝物
            reward = ITEMS[current][index]
        }
        ctx.role.addItemsNoSave(reward)
        return reward
    }
    await next();
}