exports.name = '管理员查询';
exports.type = 'I';
exports.inherit = 'manager';
exports.exec = async function (body, query, ctx) {

    const { _page_, _sort_, name, group } = body;
    const { limit, current } = _page_;

    let where = {};
    if (name) {
        where.name = new RegExp(name);
    }

    if (group && group !== 'ALL') {
        where.group = group;
    }
    const sort = {};
    if (_sort_ && _sort_.field) {
        sort[_sort_.field] = _sort_.order;
    } else {
        sort._id = -1;
    }


    const offset = (current - 1) * limit;

    let items = await this.db.mongo.admin.find(where, { password: 0 }).sort(sort).limit(limit).skip(offset);
    const total = await this.db.mongo.admin.count(where);
    items = items.map(it => {
        it = it.toObject();
        it.status = it.status === 0;
        it.id = it._id;
        return it;
    });
    return {
        items,
        total
    }

}
