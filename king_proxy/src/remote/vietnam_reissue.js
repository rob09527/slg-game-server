'use strict'
const assert = require('assert');
module.exports = async function (tranid) {
    let order = await global.dao.websale.findOne({ tranid });
    if (order && order.state == 'success') {
        return
    }
    const res = await global.remote.agent_emailProp_more({ _id: order.role.rid }, order.data.items);
    if (res == "ok") {
        let role = order.role
        await global.dao.websale.updateOne({ tranid }, { state: "success" })
        let gameorder = {
            platform: "h5",
            bundle: "越南api数据",
            channel: '越南团队api',
            version: "none",
            price: order.data.price,
            pid: `越南网页销售`,
            uid: order.data.uid,
            rid: role.rid,
            servid: order.data.serverid,
            // coupon: order.data.items.find(e => { return e.gsid == 30999 }) ? true : false,
            coupon: false,
            current_level: order.role.level,
            confirm: Date.now(),
            transactionid: tranid,
            receipt: {
                sign: order.data.sign,
                game_trade_no: '', //游戏订单ID
                channel_trade_no: tranid,// 渠道订单ID
                amount: order.data.price
            },
            deliver: Date.now()
        }
        let gameOrder = global.dao.order(gameorder);
        gameOrder.gemOidNoSave()
        await gameOrder.save();
        // 刷新付费人数
        await global.dao.order.payRoleNum();
    }
}

