'use strict'
/**
 * 查找一个玩家详情数据
 * @example // 其他实例服执行示例
 *          const res = await global.remote.agent_findrole({_id: ''}); // 需加 agent_ 前缀
 * @param opt {any}
 */
module.exports = async function (opt) {
    const role = await global.dao.role.findOne(opt);
    if(!role) return null;
    const tmp = await role.base();
    tmp.general = await role.generals();
    return tmp;
}
