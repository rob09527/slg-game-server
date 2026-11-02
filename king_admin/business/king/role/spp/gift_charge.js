exports.name = '购买特殊礼包';
exports.type = 'N';
exports.exec = async function (body, query, ctx) {
    const {servid, rid, pid, comment =''} = body;
    // pid = pid_元宝_vip经验
    const data = await this.remote.proxy_gift_charge(servid, rid, pid, comment); // 调用远程函数进行充值&发货
    const {oid} = data;
    if(!data || !oid) return '';

    return oid;
};

