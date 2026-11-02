exports.name = '越南订单补单';
exports.type = 'N';
const moment = require('moment');
exports.exec = async function (body, query, ctx) {

    const { tranid } = body;
    await this.remote.proxy_vietnam_reissue(tranid); // 调用 远程函数补单
    return "OK";
};

