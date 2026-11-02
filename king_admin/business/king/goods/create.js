
exports.name = 'H5商品设置创建';
exports.type = 'N';

exports.exec = async function (body, query, ctx) {
    const {id, pid, price, name} = body;
    const commodities = await this.service.game.collection('commodities');

    if (query.del) { // 删除操作
        const r = await commodities.deleteOne({id: id});
        return r;
    }

    const r = await commodities.updateOne({id}, {$set:{id, pid, price:+price, name}}, { upsert:true });
    return r;
};

