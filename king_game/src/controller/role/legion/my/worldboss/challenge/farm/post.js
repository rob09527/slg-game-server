
'use strict'
// 军团世界boss扫荡
module.exports = exports = async (ctx, next) => {
    const wbossconfig = global.gameconfig.legionwboss;

    // 每日挑战过后才可以扫荡
    ctx.assert(ctx.role.getItems(90389).count > 0, 'challenge first');
    let canFightingNum = wbossconfig.FIGHTING_COST || [];
    canFightingNum = canFightingNum.length;
    // 是否有挑战次数
    ctx.assert(ctx.role.getItems(90389).count < canFightingNum, 'no challenge count');


    ctx.current_damage = ctx.legionwboss.lastdamages;

}
