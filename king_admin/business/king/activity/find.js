exports.name = '活动查询';
exports.type = 'I';
exports.inherit = 'activity-view';
const moment = require('moment');
const format = 'YYYY-MM-DD HH:mm:ss';

exports.exec = async function (body, query, ctx) {
    let {_sort_, search} = body;

    const actModel = await this.service.game.collection('activities');
    const sort = {};
    if(_sort_ && _sort_.field) {
        sort[_sort_.field] = _sort_.order;
    }
    const c =   actModel.find().sort(sort);
    let items = await c.toArray();
    items.forEach(item => {
        item.start = item.start ? moment(item.start).format(format) : '';
        item.etime = item.etime ? moment(item.etime).format(format) : '';
        item.type = item.type.toUpperCase();
        if(!item.name) item.name = item.type;
    })

    if(search) {
        let filterFn = item => item.name.indexOf(search) != -1;
        if(/^[A-Za-z0-9]+$/.test(search)) {
            // 模糊搜索标识
            search = search.toUpperCase();
            filterFn = item => item.type.indexOf(search) != -1;
        }
        items = items.filter(filterFn);
    }

    return {
        items,
        total: items.length,
    }
}
