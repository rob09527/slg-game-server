'use strict'

/**
 * 支付通知， POST 请求需要配置对应的接口 免加密 NO_ENCRYPT_URLs
 * @param ctx
 * @param next
 * @return {Promise<void>}
 */
module.exports = async (ctx, next) => {

  ctx.body = 'SUCCESS';
  let {
    sign,
    game_trade_no: oid,     // 游戏订单ID
    channel_trade_no,       // 渠道订单ID
    amount
  } = ctx.request.query;
  let order = await ctx.dao.order.findOne({ oid });
  ctx.assert(order, 'ORDERNEXIST');
  let price = order.price;
  if (global.proxyconfig) {
    const config = global.proxyconfig.moneys[price];
    if (config) {
      const lang = global.config.LANG || "CN";
      price = config[lang] || 0;
    }
  }
  ctx.assert(price == amount, 'INVALID AMOUNT'); // 金额验证
  ctx.assert(ctx.payfn(ctx.request.query) === sign, 'VERIFYFAIL'); // 签名验证

  await order.orderConfirm(channel_trade_no, ctx.request.query);
  // 刷新付费人数
  await ctx.dao.order.payRoleNum();
}
