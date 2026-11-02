'use strict'

module.exports = async function () {
    const data = await global.dao.role.aggregate([{$group:{_id:"$servid",count:{$sum:1}}}]);
    let ret = {};
    data.forEach(info => {
        ret[info._id] = info.count;
    })
    return ret;
}
