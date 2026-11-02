exports.name = '邮件发送查询';
exports.type = 'I';
exports.inherit = 'maillog-view';
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
    let where = { action: 'king-mail-send' };

    let items = await this.db.mongo.log.find(where).sort(sort).limit(limit).skip(offset);
    const total = await this.db.mongo.log.count(where);

    items = items.map(({ body, adminName, create_at}) => {

        return {
            servid: body.servid,
            uid: body.uid,
            rname: body.roles ? '军团邮件' : body.rname,
            roles: body.roles && body.roles.join(','),
            reward: body.reward,
            adminName,
            title: body.title,
            content: body.content,
            create_at: moment(create_at).format("YYYY-MM-DD HH:mm:ss"),
        };
    });
    return {
        items,
        total,
    }
};

