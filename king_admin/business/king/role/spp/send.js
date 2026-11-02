exports.name = '模拟充值';
exports.type = 'N';
exports.exec = async function (body, query, ctx) {

    const {servid, rid, pid} = body;
    await this.remote.proxy_vir_reissue(servid, rid, pid); // 调用 远程函数模拟充值
    return "OK";
};

