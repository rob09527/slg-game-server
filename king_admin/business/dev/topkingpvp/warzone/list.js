exports.name = '战区查询';
exports.type = 'I';
exports.inherit = 'topkingpvp-pvpmenus';
const moment = require('moment');
const FORMAT = 'YYYY-MM-DD';
exports.exec = async function (body, query, ctx) {
    const {_page_, _sort_} = body;
    const {limit, current} = _page_;
    const offset = (current - 1) * limit;
    const opt = {};
    
    const sort = {};
    if (_sort_ && _sort_.field) {
        if (_sort_.field === 'create_at') {
            _sort_.field = '_id.create_at';
        }
        sort[_sort_.field] = _sort_.order;
    } else {
        sort['_id.create_at'] = -1;
    }
    const model = await this.service.game.collection('topkingservergroups');
    // .sort(sort).skip(offset).limit(+limit)
    const c = await model.find(opt).sort(sort).skip(offset).limit(+limit);
    const items = await c.toArray();
    const total = await model.countDocuments(opt);
    return {
        items: items,
        total
    }
};

