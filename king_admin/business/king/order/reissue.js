exports.name = '订单补单';
exports.type = 'N';
const moment = require('moment');
exports.exec = async function (body, query, ctx) {

    const {oid} = body;
    await this.remote.proxy_reissue(oid); // 调用 远程函数补单
    return "OK";
};

