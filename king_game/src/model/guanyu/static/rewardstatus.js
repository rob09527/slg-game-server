/**
 * 获取百级关羽相关信息，如不满足条件则返回undefined
 */

'use strict'

module.exports = async function(rid, ...args) {
  let record = await this.findOne({rid});
  if (!record) return;
  return await record.rewardstatus.apply(record, args);
}