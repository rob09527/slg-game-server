'use strict'

// 是否白名单
module.exports = exports = async function (uid, ip) {
    let opt;
    if (!uid || typeof uid !== "string") {
        opt = {uid:ip};
    }
    else {
        opt = {$or:[{uid:uid},{uid:ip}]};
    }
    let record = await this.findOne(opt);
    return !!record;
}
