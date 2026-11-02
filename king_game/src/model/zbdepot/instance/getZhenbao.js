
'use strict'

/**
 * 查询珍宝库中的珍宝
 * @param {Array<Number> | Number} zbidList 珍宝ID列表
 * @param {roleModel} role 角色信息,可选
 */

module.exports = async function({zbidList, role}) {
    zbidList = Array.isArray(zbidList)? zbidList : [zbidList];
    const zblist = await this.db.models
        .zhenbao.find({
            rid: this.rid,
            zbId: {
                $in: zbidList,
            },
        });
    // 挂载role
    if (role) zblist.forEach(zb => zb._role = role);
    return {
        zblist,
    }
}