
'use strict'

/**
 * 返回角色配置表上所有阵法
 * @param {String} rid 角色rid
 */
module.exports = async function (rid) {
  return await this.find({rid});
}