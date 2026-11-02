
'use strict'

// 神兽天赋进阶
module.exports = exports = async (ctx, next) => {
    console.log(ctx.mythic)
    let { index, mythic } = ctx.request.body;
    // 验参
    ctx.assert(index >= 0 && index < 4, 'invalid index');
    ctx.assert(mythic, 'invalid mythic');
    ctx.assert(ctx.mythic.talent && ctx.mythic.talent[index],'no talent data');
    // 取出天赋
    let talent = ctx.mythic.talent[index] || [];
    ctx.assert(talent.length >0,'no need update class')
    let { CAST: cast = [], CALSS_CAST: calss_cast = [], TALENTSKILL: talentskills = [] } = global.gameconfig.mythicaltalent[mythic];
    let config = cast[index] || [];
    let calss_config = calss_cast[index] || [];
    console.log('calss_config', calss_config)
    ctx.assert(config.length > 0, 'invalid config');
    ctx.assert(calss_config.length > 0, 'invalid class_config');

    // 检验是否都满足进阶条件
    for (let i = 0; i < config.length; i++) {
        console.log('config[i]', config[i])
        // 判断天赋里的每一个技能是否都满足条件
        let num = 0;
        for (let k = 0; k < config[i].length; k++) {
            console.log('config[i][k]', config[i][k])
            num += config[i][k].MAXNUM;
        }
        console.log('talent[i]', talent[i])
        // 需要升级里面的技能
        ctx.assert(talent[i],'need update skill')
        let cur = talent[i].pro || 0;
        ctx.assert(cur >= num, 'no enough');
    }
    let castflag = true;
    // 检验进阶材料是否满足
    for (let _config of calss_config) {
        console.log('_config', _config)
        let count = ctx.role.getProp(_config.GSID);
        console.log('count', count)
        if (count < _config.COUNT) {
            castflag = false;
            break;
        }

    }
    ctx.assert(castflag, 'no enough class');
    // 判断是否已经进阶成功,进阶成功就不需要再次进阶
    ctx.assert(!ctx.mythic.talentskill || !ctx.mythic.talentskill[index], 'had update class');

    // 扣除资源
    ctx.role.castItemsNoSave(calss_config);
    // 进阶后技能加上
    let talentskill = ctx.mythic.talentskill || [];
    talentskill[index] = talentskills[index];
    ctx.mythic.talentskill = talentskill;
}