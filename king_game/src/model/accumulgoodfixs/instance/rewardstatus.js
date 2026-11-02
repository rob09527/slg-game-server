/**
 * 获取记录的状态
 */

 'use strict'

 module.exports = async function() {
  const toUp = this.hdtype.toUpperCase();
  const configs = global.gameconfig.zhd[toUp] || global.gameconfig.zhd_newhero[toUp];
   // 查询那些任务已完成
   return configs.map(({ CONDS, REWARDS }, i) => {
    
    let meets = CONDS.map(cond => parseInt(this.totals[cond.COND]) >= +cond.COUNT ? 1 :0 );
    // 是否已经领取过 && 不存在0即为完成此任务
    return { status: this.rewardtime[i] ? 2 : !meets.includes(0) ? 1 : 0, items: REWARDS };
});

}