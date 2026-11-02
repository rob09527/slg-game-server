'use strict';

//固定属性养成数据接口
module.exports = exports = async (ctx) => {
    let secretRealm = ctx.role.secretRealm
    ctx.body = secretRealm.csz ?? {}
};
