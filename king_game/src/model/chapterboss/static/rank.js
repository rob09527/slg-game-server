'use strict';

const assert = require('assert');

/**
 * 排行榜
 *
 *
 */
module.exports = exports = async function (type, myRole) {
    const ownerId = myRole.i();
    let rankList = await this.find({type: type, maxsubindex: {$gt: 0} }, {rid: 1, maxsubindex: 1}).sort({maxsubindex: -1, last: 1}).limit(100);
    const roles = await global.dao.role.find({_id: {$in: rankList.map(r => r.rid)}}, {
        rname: 1,
        headid: 1,
        frameid: 1,
        'hide.38003': 1,
        'hide.38001': 1,
        update: 1,
        set: 1,
        _power: 1,
        sex: 1,
        _id: 1
    });
    const roleMap = {};
    roles.forEach(role => {
        roleMap[role._id] = {
            rname: role.name,
            name: role.name,
            headid: role.headid,
            frameid: role.frameid,
            vip: role.vip,
            set: role.set,
            level: role.level,
            sex: role.sex,
            lastest: role.update,
            isonline: role.isonline,
            power: role._power,
        };
    });
    let selfrank;
    let selfsubindex;
    rankList = rankList.map((item, index) => {
        item = item.toObject();
        item.rank = index + 1;
        Object.assign(item, roleMap[item.rid]);
        if (!selfrank && item.rid === ownerId) {
            selfrank = item.rank;
            selfsubindex = item.maxsubindex;
        }
        item.subindex = item.maxsubindex;
        delete item.maxsubindex;
        return item;
    });

    if (!selfrank) {
        const ownerRank = await this.findOne({type: type, rid: ownerId, maxsubindex: {$gt: 0} }, {rid: 1, maxsubindex: 1});
        if (ownerRank){
            selfsubindex = ownerRank.maxsubindex;
            selfrank = await this.countDocuments({type: type, subindex: {$gte: ownerRank.maxsubindex }});
        } else {
            selfsubindex = 0;
            selfrank = -1;
        }
    }

    return {
        list: rankList,
        selfrank: selfrank,
        selfsubindex
    };
};
