
'use strict'

/**
 * 
 * @param {string} rid 角色rid
 * @param {number} zid 阵法id
 * @returns 返回阵法数据实体
 */
module.exports = async function(rid, zid) {
  return await this.findOne({rid, zid});
}