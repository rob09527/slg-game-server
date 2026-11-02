exports.name = '游戏商品查询';
exports.type = 'O';

exports.exec = async function (body, query, ctx) {
    const items = await this.db.mongo.sppack.find();
    return {
        items: items.map(item => {
            item = item.toObject();
            item.status = item.status === 1 ? '允许' : '不允许';
            return item;
        }),
        total: items.length
    }
};

