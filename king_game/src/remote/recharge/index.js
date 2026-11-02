'use strict'
 const rechargeConfirm = require('./post');
const textgetter = require("../../util/textgetter");
/**
 * 订单发货
 * @param params {{ pid: string, rid: string, orderid: string, amount: number }}
 */
module.exports = async function (params) {

    const {
        rid,
    } =  params;
    const role = await global.dao.role.findOne({_id: rid});
    const ctx = {
        dao: global.dao,
        assert: assert,
        request:{
            body: params
        },
        role: role,
        textgetter,
        zhdpoint: require("../../util/event/point").bind(role),
        pandapoint: require("../../util/event/panda").bind(role),
        is_batch: require('../../util/is_batch'),
    }
    await rechargeConfirm(ctx);
    // const now = Date.now();
    // global.pushClient(role, {
    //     confirm: now,
    //     deliver: now,
    // }, "DELIVER")
}
