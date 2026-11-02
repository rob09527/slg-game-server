'use strict'
const _ = require('lodash');
const businessCode = require("../../../../util/businessCode");

function arraysHaveSameContent(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    const str1 = JSON.stringify(arr1.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))));
    const str2 = JSON.stringify(arr2.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))));
    return str1 === str2;
}

/**
 * 越南物品添加接口 
 * @param ctx
 * @param next
 * @return {Promise<void>}
 */
module.exports = async (ctx, next) => {
    let {
        sign,
        tranid,
        fid,
        serverid,
        packageid,
        items,
    } = ctx.request.body;

    ctx.body = businessCode.success;
    if (ctx.payvietnam(ctx.request.body) !== sign && !global.config.ITEMTEST) {
        ctx.body = businessCode.signature_failed
        return;
    }
    let order = await ctx.dao.websale.findOne({ tranid });
    if (order) {
        ctx.body = businessCode.order_exists;
        return
    }

    let packageinfo = await ctx.dao.websaleconfig.findOne({ packageid });

    if (!packageinfo || !packageinfo.price || !packageinfo.items || packageinfo.state != 2) {
        ctx.body = businessCode.packages_error;
        return
    }
    let configItem = packageinfo.items

    if (!arraysHaveSameContent(configItem, items) && !global.config.ITEMTEST) {
        ctx.body = businessCode.packages_config_error;
        return
    }


    let price = packageinfo.price
    let uid = global.config.ITEMTEST ? fid : 'sdk_hunfu' + fid

    let gameservs = Object.values(global.gameservs)
    const game = gameservs[_.random(0, gameservs.length - 1)];
    const roles = await game.remote.findRolesByUid(uid);
    const roleMap = {};
    roles.forEach(role => {
        roleMap[role.servid] = role;
    });
    const role = roleMap[serverid]
    if (!role) {
        ctx.body = businessCode.user_does_not_exist;
        return
    }

    //封装越南数据结构
    let data = {
        tranid: tranid,
        data: { ...ctx.request.body, uid, price, },
        role: role,
        state: "pending",
        type: 'yn'
    }

    await ctx.dao.websale.create(data)


    const res = await global.remote.agent_emailProp_more({ _id: role.rid }, items);
    if (res == "ok") {
        await ctx.dao.websale.updateOne({ tranid }, { state: "success" })
        let gameorder = {
            platform: "h5",
            bundle: "越南api数据",
            channel: '越南团队api',
            version: "none",
            price: price,
            pid: `越南网页销售`,
            uid: uid,
            rid: role.rid,
            servid: serverid,
            confirm: Date.now(),
            transactionid: tranid,
            current_level: role.level,
            // coupon: items.indexOf(e => { return e.gsid == 30999 }) ? true : false,
            coupon: false,
            receipt: {
                sign: sign,
                game_trade_no: '',     //游戏订单ID
                channel_trade_no: tranid,// 渠道订单ID
                amount: price
            },
            deliver: Date.now()
        }
        let gameOrder = ctx.dao.order(gameorder);
        gameOrder.gemOidNoSave()
        await gameOrder.save();
        // 刷新付费人数
        await ctx.dao.order.payRoleNum();

        await game.remote.webczphb(price, role.rid);
    }

}




