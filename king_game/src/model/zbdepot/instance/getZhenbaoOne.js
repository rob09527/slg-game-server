
'use strict'

/**
 * 查询珍宝库中的珍宝
 * @param {Array<Number> | Number} zbidList 珍宝ID列表
 * @param {roleModel} role 角色信息,可选
 * @returns {}
 */
module.exports = async function({zbid, role}) {
    const {
        zblist: list,
    } = await this.getZhenbao({zbidList: zbid, role});
    return {
        zhenbao: list[0],
    };
}