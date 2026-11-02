
'use strict'

// 神兽天赋(一键突破)
module.exports = exports = async (ctx, next) => {
    console.log(ctx.mythic)
    let { index, id, mythic } = ctx.request.body;
    // 验参
    ctx.assert(index < 4 && index >= 0, 'invalid index');
    ctx.assert(id >= 0 && id < 3, 'invalid id');
    ctx.assert(mythic, 'invalid mythic');
    // 取出天赋
    if (!ctx.mythic.talent) {
        ctx.mythic.talent = [];
        // 创建二位数组 [[{pro:10},{},...],[{}]]
    } 
    let talent = ctx.mythic.talent[index] || []
    if (!ctx.mythic.talent[index]) {
        talent[index] = [];
        talent = talent[index];
    }
    console.log("talent", talent);
    let { CAST: cast = [] } = global.gameconfig.mythicaltalent[mythic];
    let config = cast[index][id] || [];
    ctx.assert(config.length > 0, 'invalid config');
    let innertalent = talent[id] || {}
    // 当前进度
    let pro = innertalent.pro || 0;
    // 检测是否满足条件
    for (const item of config) {
        let nowNum = ctx.role.getProp(item.PMARK);
        ctx.assert(nowNum > 0, 'no enought')
        let maxNum = item.MAXNUM;
        let castnum = maxNum - pro;
        console.log('castnum',castnum)
        console.log('nowNum',nowNum)
        // 判断是否够扣,扣的数大于持有,选择当前持有；扣的数小于持有,选扣的数;
        let count = castnum > nowNum ? nowNum : castnum;
        if (count) {
            ctx.role.castItemsNoSave({ GSID: item.PMARK, COUNT: count });
            // 更新逻辑
            pro += count;
        }
    }
    innertalent.pro = pro;
    ctx.mythic.talent[index] = talent;
    ctx.mythic.talent[index][id] = innertalent;

    // 检验是否都满足进阶条件
    let check = 0
    let config2 = cast[index] || [];
    for (let i = 0; i < config2.length; i++) {
        // 判断天赋里的每一个技能是否都满足条件
        let num = 0
        for (let k = 0; k < config2[i].length; k++) {
            num += config2[i][k].MAXNUM;
        }
        // 需要升级里面的技能
        if(talent[i]){
            let cur = talent[i].pro || 0;
            if(cur >= num) {
                check++;
            }
        }
    }
    if(check == config2.length){
        // 为了触发推荐礼包
        ctx.role[`MYTHICAL_TALENT_LV_MAX`] = 1;       
    }

    console.log("ctx.mythic.talent",ctx.mythic.talent)
    return
}