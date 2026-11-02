exports.name = '模拟充值查询';
exports.type = 'I';
exports.inherit = 'recharge-view';
const moment = require('moment');
exports.exec = async function (body, query, ctx) {
    const { _page_, _sort_, uid, rname } = body;

    const { limit, current } = _page_;
    const offset = (current - 1) * limit;
    const sort = {};
    if (_sort_ && _sort_.field) {
        sort[_sort_.field] = _sort_.order;
    } else {
        sort.create_at = -1;
    }
    let where = { action: 'king-role-spp-send' };

    let items = await this.db.mongo.log.find(where).sort(sort).limit(limit).skip(offset);
    const total = await this.db.mongo.log.count(where);

    items = items.map(({ body, adminName, create_at}) => {
        let bd = body.body ? body.body : body;
        return {
            servid: bd.servid,
            uid: bd.uid,
            rname: bd.rname,
            spppid: bd.spppid,
            adminName,
            reason: bd.reason ? bd.reason : "无",
            create_at: moment(create_at).format("YYYY-MM-DD HH:mm:ss"),
        };
    })
    return {
        items,
        total,
    }
};

