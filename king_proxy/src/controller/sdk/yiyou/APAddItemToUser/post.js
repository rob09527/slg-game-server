'use strict'

const businessCode = require("../../../../util/businessCode");

/**
 * 支付通知， POST 请求需要配置对应的接口 
 * @param ctx
 * @param next
 * @return {Promise<void>}
 */
module.exports = async (ctx, next) => {
    let {
        sign,
        tranid,//他们的订单号
        fid,//角色id
        serverid,//服务器id
        coo_order_id,//我们的订单号
        price,   //价格

    } = ctx.request.body;
    if (ctx.payvietnam(ctx.request.body) != sign) {
        ctx.body = businessCode.signature_failed
        return;
    }

    ctx.body = businessCode.success
    let order = await ctx.dao.order.findOne({ oid: coo_order_id });
    if (!order) {
        ctx.body = businessCode.order_not_exists
        return
    }
    if (order.receipt || order.deliver) {
        ctx.body = businessCode.order_exists
        return
    }

    let orderPrice = order.price;
    // if (global.proxyconfig.moneys) {
    //     const config = global.proxyconfig.moneys[orderPrice];
    //     if (config) {
    //         const lang = global.config.LANG || "CN";
    //         orderPrice = config[lang] || 0;
    //     }
    // }

    if (orderPrice !== price) {
        ctx.body = businessCode.invalid_amount
        return;
    }

    try {
        let data = {
            tranid: tranid,
            data: ctx.request.body,
            state: "pending",
        }
        await ctx.dao.websale.create(data)
    } catch (error) {

    }

    let parameters_old = {
        sign: ctx.request.body.sign,
        game_trade_no: ctx.request.body.coo_order_id,     // 游戏订单ID
        channel_trade_no: ctx.request.body.tranid,       // 渠道订单ID
        amount: ctx.request.body.price
    };

    await order.orderConfirm(tranid, parameters_old);
    // 刷新付费人数
    await ctx.dao.order.payRoleNum();
    order = await ctx.dao.order.findOne({ oid: coo_order_id });
    if (order.receipt) {
        await ctx.dao.websale.updateOne({ tranid }, { state: "success" })
    }
    ctx.body = businessCode.success
    return;
}



