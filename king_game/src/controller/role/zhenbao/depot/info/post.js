
'use strict'
/**
 * 获取珍宝库及珍宝信息
 */
module.exports = async ctx => {
    const {
        zblist: exist_zbs,
    } = await ctx.depot.getZhenbaoAll({
        role: ctx.role
    });
    // 珍宝
    const jewel = {};
    for (let zb of exist_zbs) {
        let {
            slv: level,
            attr: prop,
            skill,
        } = zb.info(true);
        jewel[zb.zbId] = {
            level,
            prop,
            skill,
        }
    }
    // 珍宝库
    const {
        lv: level,
        exp: nowexp,
        attr: prop,
    } = ctx.depot.info();
    ctx.body = {
        jewel,
        zbk: {
            level,
            nowexp,
            prop,
        },
    }
}