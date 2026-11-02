'use strict'
const assert = require("assert");
/**
 * 角色道具发放
 * @example // 其他实例服执行示例
 *          const res = await global.remote.agent_prop_add({_id: rid}, [{gsid:38001, count:100}]; // 需加 agent_ 前缀
 * @param roleinfo {{_id?: string, uid?: string, rno?: number, servid?: number}}
 * @param items [{gsid:number,count:number}]
 */
module.exports = async function (roleinfo, items, reason = 'GM_SEND') {
    const role = await global.dao.role.findOne(roleinfo);
    assert(role, 'err role');
    role._path_ = reason;
    for (let {gsid, count} of items) { 
        count = parseInt(count);
        let fn = 'addItemsNoSave';
        if (count < 0) fn = 'castItemsNoSave';
        count = Math.abs(count);
        role[fn]({gsid: gsid, count: count}, 'manual')
        console.log('MANUAL ADD', role.uid, role.servid, gsid, count, reason);
    }
    await role.save();
    return 'ok';
}
