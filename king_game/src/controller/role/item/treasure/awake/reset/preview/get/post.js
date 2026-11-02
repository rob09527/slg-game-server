/**
 * 获取觉醒宝物预览数据(中间件中处理)
 */

'use strict'

module.exports = async (ctx, next) => {
  ctx.assert(ctx.treasure_obj.property_preview && Object.keys(ctx.treasure_obj.property_preview).length > 0, 'preview nexist');
}