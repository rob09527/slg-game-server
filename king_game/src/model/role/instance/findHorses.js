/**
 * 查找新坐骑
 * guids: 指定查找新坐骑的guid列表,可无,若指定则返回指定新坐骑的信息
 */
'use strict';

module.exports = exports = async function (guids) {
 
    const opt = {
        rid: this._id.toString(),
    };

    const isFindArray = (!guids) || Array.isArray(guids);
    if (guids) {
        opt._id = isFindArray ? {$in: guids} : guids;
    }
    const horseList = await this.db.models.horse.find(opt).hint({rid:1});
    const horseMap = {};
    horseList.forEach(p => {
        horseMap[p._id.toString()] = p;
    }); // 将新坐骑转换为 map类型

     if (!isFindArray) { // 如果只查一个就返回这个
        return horseMap[guids];
    }
    return horseMap;
};
