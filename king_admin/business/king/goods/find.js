exports.name = 'H5商品设置查询';
exports.type = 'I';
exports.inherit = 'goods-view';

exports.exec = async function (body, query, ctx) {
    const {_page_, _sort_, id, pid} = body;
    const {limit, current} = _page_;
    const offset = (current - 1) * limit;
    const opt = {};
    const sort = {};
    if (id && id !== 'ALL') {
        opt.id = +id;
    }
    if (pid && pid !== 'ALL') {
        opt.pid = pid;
    }
    if (_sort_ && _sort_.field) {
        sort[_sort_.field] = _sort_.order;
    } else {
        sort._id = -1;
    }
    const commodities = await this.service.game.collection('commodities');
    const cursor = await commodities.find(opt).sort(sort).skip(offset).limit(+limit);
    const items = await cursor.toArray();
    const total = await commodities.countDocuments(opt);
    return {
        items: items,
        total
    }
};

