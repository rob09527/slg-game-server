exports.name = '渠道设置查询';
exports.type = 'I';
exports.inherit = 'channel-view';
const moment = require('moment');
exports.exec = async function (body, query, ctx) {
    const {_page_, _sort_, gameid} = body;
    const {limit, current} = _page_;
    const offset = (current - 1) * limit;
    const opt = {};
    const sort = {};
    if (gameid && gameid !== 'ALL') {
        opt.gameid = gameid;
    }
    if (_sort_ && _sort_.field) {
        sort[_sort_.field] = _sort_.order;
    } else {
        sort._id = -1;
    }
    const channels = await this.service.game.collection('channels');
    const cursor = await channels.find(opt).sort(sort).skip(offset).limit(+limit);
    const items = await cursor.toArray();

    const total = await channels.countDocuments(opt);
    return {
        items: items,
        total
    }
};

