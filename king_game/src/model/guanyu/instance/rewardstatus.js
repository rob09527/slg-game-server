/**
 * 获取百级关羽相关信息，如不满足条件则返回undefined
 */

'use strict'

module.exports = async function(card1day = 0, card2day = 0) {
  let {
    REWARD,
  } = global.gameconfig.guanyu;
  let isUpdate = false;
  let map = REWARD.map(({ITEMS: items, COND, LV_INTRO:lvIntro, INTRO: intro}, index) =>{
    let data = {
      items,
      level: COND[0],
      lvIntro,
      intro,
    };
    let [
      cond0,
      cardtype = 0,
    ] = COND;
    if (cardtype) data.condition = COND[1];
    cond0 = this.level >= cond0? 1: 0;
    let cond1 = true;
    if (cardtype) {
      switch(cardtype) {
        case 1:
          cond1 = card1day > 0;
          break;
        case 2:
          cond1 = card2day > 0;
          break;
      }
    }
    //data.status = this.rewardtime[index] ? 2 : (cond0 && cond1) ? 1 : 0;
    if(cond0 && cond1 && !this.status[index]){
      this.status[index] = 1;
      isUpdate = true;
    }
    // 修复状态值不是数字类型
    if(typeof this.status[index] !== 'number') this.status[index] = 0;
    data.status = this.status[index] || 0;
    return data;
  })
  if(isUpdate){
    await this.updateOne({$set:{status: this.status}})
  }
  return map
}