'use strict'
const crypto = require('crypto');
const assert = require('assert');
/**
 * 网页礼包充值
 */

module.exports = async (ctx, next)=>{
    let {
        sign,
        server_id,
        user_id,
        role_id,
        goods_id
    } = ctx.request.query;
    ctx.assert(ctx.h5postfn(ctx.request.query) === sign, 'VERIFYFAIL'); // 签名验证
    const role = await global.remote.agent_findrole({$or:[{_id: role_id},{rno: +role_id}]});
    if(!role) { // 角色不存在
        ctx.body.msg = "role nexist"
        return;
    }
    let goods = await global.dao.commodity.findOne({id:goods_id});
    ctx.assert(goods, 'goods id error'); 

    try{
        const params = {
            uid: user_id,
            servid: server_id,
            rid: role.id,
            pid: goods.pid,
            price: goods.price,
            channel: ctx.channel
        }

        let orderData = new global.dao.order(params);
        orderData.gemOidNoSave();
        await orderData.save();

        // 创建成功后发货
        await orderData.orderConfirm(orderData.oid, params);
        return ctx.body = {oid: orderData.oid};
    }catch(err){
        console.error('[WEB CHARGE] err =', err);
        assert(true, 'web charge error = ' + err);
    }
}
