/**
 * 返回先锋召唤前端显示奖池配置
 */

'use strict'

module.exports = async ctx => {
  ctx.body = global.gameconfig.vanguard_general_frontend;
}