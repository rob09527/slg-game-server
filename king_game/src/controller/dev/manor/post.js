
'use strict'

const ms = require('ms');
// 创建测试账号
module.exports = exports = async (ctx, next) => {

    ctx.body = {};
    const { UP_BUILDING: UP_CONFIG } = global.gameconfig.manor;
    let manors = await ctx.dao.manor.find({}, { rid: 1, mlevel: 1 });
    for (let { rid, mlevel } of manors) {
        console.log('rid', rid)
        let items = []
        // 查其他建筑等级
        let builds = await ctx.dao.manorbuilding.find({ rid }, { lv: 1, pos: 1, id: 1 });
        // 主城返还
        for (let lv = 1; lv < mlevel; lv++) {
            items.push(UP_CONFIG[1].INFO[lv].COST);
        }
        // 建筑返还
        for (let { lv, id } of builds) {
            for (let i = 1; i < lv; i++) {
                let item = UP_CONFIG[id].INFO[i].COST;
                console.log(`建筑--->id:${id}`, item);
                items.push(item);
            }
        }
        items = items.arrange();

        ctx.dao.mail.create({
            type: 2, rid,
            title: '封地建筑资源返还',
            content: '主公，因封地系统功能调整，原有的建筑等级被全部重置，现将您升级建筑的全部资源返还，请主公查收。',
            reward: items,
        }).catch(console.error);
    }

}