exports.name = '热更资源查询';
exports.type = 'I';
exports.inherit = 'hotupd-view';
const moment = require('moment');
exports.exec = async function (body, query, ctx) {
    const {_page_, _sort_, platform} = body;
    const {limit, current} = _page_;
    const offset = (current - 1) * limit;
    const opt = {status: {$gte: 0}};
    const sort = {status: -1};
    if (platform && platform !== 'ALL') {
        opt.platform = platform;
    }
    if (_sort_ && _sort_.field) {
        sort[_sort_.field] = _sort_.order;
    } else {
        sort._id = -1;
    }
    const hotupds = await this.service.game.collection('hotupds');
    const cursor = await hotupds.find(opt).sort(sort).skip(offset).limit(+limit);
    const items = await cursor.toArray();
    const total = await hotupds.countDocuments(opt);
    items.forEach(item => {
        item.status_str = item.status === 2 ? '已上线' : item.status === 1 ? '测试中' : '未启用';
        if(item.force_cb) {
            item.status_str = `${item.status_str}[强制]`;
        }
        // item.whitelist_str = item.whitelist ? item.whitelist.join(',') : "";
    })
    return {
        items: items,
        total
    }
};

