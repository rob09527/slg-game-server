exports.name = 'IOS审核查询';
exports.type = 'I';
exports.inherit = 'iosversion-view';
const moment = require('moment');
exports.exec = async function (body, query, ctx) {
    const {_page_, _sort_, gameid} = body;
    const {limit, current} = _page_;
    const offset = (current - 1) * limit;
    const opt = {status: {$gte: 0}};
    const sort = {status: -1};
    if (gameid && gameid !== 'ALL') {
        opt.gameid = gameid;
    }
    if (_sort_ && _sort_.field) {
        sort[_sort_.field] = _sort_.order;
    } else {
        sort._id = -1;
    }
    const iosversions = await this.service.game.collection('iosversions');
    // console.log("iosversions",iosversions)
    const cursor = await iosversions.find(opt).sort(sort).skip(offset).limit(+limit);
    const items = await cursor.toArray();
    const total = await iosversions.countDocuments(opt);
    items.forEach(item => {
        item.status_str = item.status === 1 ? '启用' : '未启用';
    })
    return {
        items: items,
        total
    }
};

