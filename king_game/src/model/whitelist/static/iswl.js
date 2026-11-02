'use strict'

// 是否白名单
module.exports = exports = async function (uid) {
    if (!uid || typeof uid !== "string") {
        return false;
    }
    let record = await this.findOne({uid});
    return !!record;
}
