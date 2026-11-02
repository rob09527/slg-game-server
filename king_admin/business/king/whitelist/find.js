exports.name = '白名单查询';
exports.type = 'I';
exports.inherit = 'whitelist-view';
const moment = require('moment');
exports.exec = async function (body, query, ctx) {
    const {_page_, _sort_} = body;
    const {limit, current} = _page_;
    const offset = (current - 1) * limit;
    const opt = {};
    const sort = {};

    if (_sort_ && _sort_.field) {
        sort[_sort_.field] = _sort_.order;
    } else {
        sort._id = -1;
    }
    const whitelistModel = await this.service.game.collection('whitelists');
    const cursor = await whitelistModel.find(opt).sort(sort).skip(offset).limit(+limit);
    const items = await cursor.toArray();
    const total = await whitelistModel.countDocuments(opt);

    return {
        items: items,
        total
    }
};

