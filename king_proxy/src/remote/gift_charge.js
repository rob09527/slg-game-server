'use strict'
const assert = require('assert');
/**
 * 指定礼包充值
 * @example 游戏服代码实例
 * const res = await global.remote.proxy_gift_recharge(servid, rid, pid, comment);
 * @return {Promise<any>}
 * @param servid
 * @param rid 角色唯一id
 * @param pid 商品id : pid_元宝_vip经验
 * @param comment 备注内容, 可选
 */
module.exports = async function (servid, rid, pid, comment ='') {
    //return await global.dao.order.deliver(servid, rid, pid, null, 0, false, false, 1);
    const tmpPids = [
        'charge10000_100000_100000' //  pid_元宝_vip经验
    ];

    console.log('[GIFT CHARGE] param =', servid, rid, pid, comment);

    const pidInx = tmpPids.indexOf(pid);
    assert(pidInx >= 0 && tmpPids[pidInx], 'pid unmatch');
    assert(rid, 'param rid error');

    const gameInstances = Object.values(global.gameservs);
    const index = Math.floor(gameInstances.length * Math.random());
    const game = gameInstances[index] || gameInstances[0]; // 随机调用一台游戏实例来获取商品列表
    assert(game, 'deliver error,no game instances');

    const role = await game.remote.findRolesByRid(rid.toString());
    assert(role.servid == +servid, 'server_id unmatch');

    try{
        let [priceStr] = tmpPids[pidInx].split('_');
        const params = {
            servid,
            rid: rid.toString(),
            uid: role.uid,
            pid: `gmsys_${pid}`,
            price: +(priceStr.split('charge')[0]),
            current_level: role.level, // 埋下单时候的角色等级
            vip: role.vip, // 埋下单时候的角色等级
            platform: role.platform,
            bundle: role.bundle,
            channel: role.channel
        }
        let orderData = new global.dao.order(params);
        orderData.gemOidNoSave();
        await orderData.save();

        // 创建成功后发货
        await orderData.orderConfirm(orderData.oid, {...params, comment});
        return {oid: orderData.oid};
    }catch(err){
        console.error('[GIFT CHARGE] err =', err);
        assert(true, 'gift charge error');
    }

}
