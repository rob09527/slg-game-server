'use strict'

/**
 * cdkey兑换
 * @example // 其他实例服执行示例
 *          const res = await global.remote.agent_cdkey_items(); // 需加 agent_ 前缀
 * @param roleinfo {{_id?: string, uid?: string, rno?: number, servid?: number}}
 */
module.exports = async function (roleinfo, name, times, items) {
    const role = await global.dao.role.findOne(roleinfo);
    assert(role, 'err role');
    role._path_ = "GM_CDKEY";
    console.log(name, times, items)
    role.cdkeys[name] = ++times;
    role.markModified('cdkeys.' + name)
    role.addItemsNoSave(items);
    await role.save();
    return 'ok';
}
