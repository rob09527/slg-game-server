
'use strict'

/**
 * 
 * @param {string} role
 * @returns 返回已解锁阵法的红点
 */
module.exports = async function(role) {
  
  const zfarr = await this.find({rid: role._id});
  let redData = zfarr.map(zf =>{
    const conf = global.gameconfig.zhenfa_star[zf.zid - 101][zf.level];
    if(!conf || !conf.CAST) return;
    // 是否可升星
    let meets = conf.CAST.map(cost => cost && +role.getProp(cost.GSID) >= +cost.COUNT)
    return meets.filter(elem =>elem).length;
  });

  return redData.filter(elem =>elem).length;
}