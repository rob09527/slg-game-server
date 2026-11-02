/**
 * 查找灵宠物
 * guids: 指定查找宠物的guid列表,可无,若指定则返回指定宠物的信息
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
    const petList = await this.db.models.pet.find(opt).hint({rid:1});
    const petMap = {};
    petList.forEach(p => {
        petMap[p._id.toString()] = p;
    }); // 将宠物转换为 map类型

     if (!isFindArray) { // 如果只查一个就返回这个
        return petMap[guids];
    }
    return petMap;
};
