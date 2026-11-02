'use strict'

/**
 * 支付通知，POST 请求需要配置对应的接口 免加密 NO_ENCRYPT_URLs
 * @param ctx
 * @param next
 * @return {Promise<void>}
 */
module.exports = async (ctx, next)=>{

  ctx.body = 'SUCCESS';
  let {
    sign,
    order_no: oid,
    channel_order_no, // 根据渠道方的通知 数据结构拿关键数据
    price = 0
  } = ctx.request.query;
  let order = await ctx.dao.order.findOne({oid});
  ctx.assert(order, 'ORDERNEXIST');
  ctx.assert(order.price == price ,'invalid price'); // 金额验证
  ctx.assert(ctx.signfn(ctx.request.query) === sign, 'VERIFYFAIL'); // 签名验证

  await order.orderConfirm(channel_trade_no, ctx.request.query);
}
