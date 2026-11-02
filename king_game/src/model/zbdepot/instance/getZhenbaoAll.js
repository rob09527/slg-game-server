
'use strict'

/**
 * 查询珍宝库中所有的珍宝
 * @param {roleModel} role, 可选
 * @returns {Array<zhenbao>} zblist
 */

module.exports = async function(params = {}) {
    const {
        role,
    } = params;
    const zblist = await this.db.models
        .zhenbao.find({
            rid: this.rid,
        });
    // 挂载角色信息
    if (role && role.i() === this.rid) {
        zblist.forEach(zb => zb._role = role);
    }
    return {
        zblist,
    }
}