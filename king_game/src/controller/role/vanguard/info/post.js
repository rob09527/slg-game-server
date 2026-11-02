/**
 * 获取时间等信息
 */

'use strict'

module.exports = async ctx =>{
  ctx.body = {
    // 60天
    end: ctx.record.start + 60 * 24 * 60 * 60 * 1000,
    nextguarantee: 25 - ctx.record.counter,
  }
}