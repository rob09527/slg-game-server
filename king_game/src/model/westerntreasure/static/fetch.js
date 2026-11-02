"use strict"

/**
 * 获取 schema 对象
 * @param {String} rid 角色 ID
 * @param {String} type 西域宝藏类型
 * @returns {Array} [schema对象,是否是新创建]
 */
module.exports = async function (rid, type) {
    let isCreate = false
    const cond = { rid }
    if (type) cond.type = type
    let one = await this.findOne(cond);
    if (one) return [one, isCreate]
    const wt = await this[`f${type}`](rid)
    isCreate = true
    return [wt, isCreate]
}