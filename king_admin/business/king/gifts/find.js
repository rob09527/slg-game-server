exports.name = '推荐礼包查询';
exports.type = 'I';
exports.inherit = 'mail-view';
exports.exec = async function (body, query, ctx) {

    const {_page_, _sort_, create} = body;
    const {serverid: servid, rid} = query;
    const {limit, current} = _page_;


    const offset = (current - 1) * limit;
    const opt = {};
    if (rid) { // rno
        opt.rid = rid;
    }

    if (create && create[1]) {
        const [start, end] = this.parseDateMatch(create);
        opt.create = {$gte: start, $lte: end}
    }

    const sort = {};
    if (_sort_ && _sort_.field) {
        sort[_sort_.field] = _sort_.order;
    } else {
        sort._id = -1;
    }

    const giftModel = await this.service.game.collection('c_recommp_gifts');
    const cursor = await giftModel.find(opt).sort(sort).skip(offset).limit(+limit);
    const items = await cursor.toArray();
    items.forEach(item => {
        item.servid = servid;
        if (item.rewards && item.rewards.length) {
            item.rewardStr = item.rewards.map(one => `${one.GSID || one.gsid}*${one.COUNT || one.count}`).join(',');
        }
    })
    const total = await giftModel.countDocuments(opt);
    return {
        items: items,
        total: total
    }
};

