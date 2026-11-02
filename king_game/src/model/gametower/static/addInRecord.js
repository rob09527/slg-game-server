'use strict'

/**
 *
 * @param opt {object}
 */
// 是否加入全局tower前3
module.exports = exports = async function (opt) {
    // floor 楼层
    // type 类型 tower/ occutower
    // occu 职业
    // role 数据
    let { floor, type, occu, role, groupid } = opt;
    let obj = {};
    obj['floor'] = floor;
    obj['type'] = type;
    obj['groupid'] = groupid;
    if (occu) obj['occu'] = occu;
    let result = await this.findOne(obj);
    if (!result) {
        // 创建
        obj['record'] = obj['record'] || [];
        obj['record'].push(role);
        await this.create(obj);
    } else {
        // 判断是否满了
        if (result.record && result.record.length < 3) {
            await this.updateOne(obj, { $push: { record: role} });
        }
    }

}
