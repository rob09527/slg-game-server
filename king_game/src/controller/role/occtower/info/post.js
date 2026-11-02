
'use strict'
// 职业试炼-获取当前的闯关层数
const occtowerConfig = global.gameconfig.occtower.TOWERINFO;
module.exports = exports = async (ctx, next) => {
    let occtowerList = await ctx.dao.tower.find({ rid: ctx.role._id, type: 'occutower' }, { occu: 1, record: 1 });
    let list = {};
    let type = Object.keys(occtowerConfig);// 所有类别
    for (let i = 0; i < type.length; i++) {
        // 没有记录
        list[type[i]] = 1;
        for (let tower of occtowerList) {
            if (tower.occu == type[i]) {
                list[type[i]] = tower.record.length +1 > occtowerConfig[type[i]].length ? 0 : tower.record.length+1;
                break;
            }
        }
        
    }
    return ctx.body = list;
}