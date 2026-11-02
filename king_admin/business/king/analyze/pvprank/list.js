const ObjectId = require('mongodb').ObjectId;
exports.name = '单人擂台排行查询';
exports.type = 'I';
exports.inherit = 'analyze-ltvmenus';


exports.exec = async function (body, query, ctx) {
    const {_page_, _sort_, servid, bundle, create, update} = body;
    const {limit, current} = _page_;
    const offset = (current - 1) * limit;


    const $match = {};

    if (servid && servid !== 'ALL') {
        $match.servid = Number.parseInt(servid);
    } else {
        const servers = await this.service.game.serversOptions(ctx.adminRole);
        if (!servers.__is_all__)  // 被隔离了
            $match['servid'] = {
                $in: servers.map(s => s.value)
            }
    }

    if (bundle && bundle.length) {
        $match.bundle = {
            $in:   this.db.mongo.bundle.parseBundlesMatch(bundle)
        };
    }

    if (create && create[1]) {
        const [start, end] = this.parseDateMatch(create);
        // 两边数据表时间格式不一样， 分开 写条件
        $match.create = {
            $gte: start,
            $lte: end
        };
    }

    if (update && update[1]) {
        const [start, end] = this.parseDateMatch(update);
        // 两边数据表时间格式不一样， 分开 写条件
        $match.update = {
            $gte: start,
            $lte: end
        };
    }

    const sort = {};
    if (_sort_ && _sort_.field) {
        sort[_sort_.field] = _sort_.order;
    } else {
        sort.pvpscore = -1;
    }

    sort._power = -1;
    const roleModel = await this.service.game.collection('roles');


    const itemc = await roleModel.find($match).project({
        uid: 1,
        servid: 1,
        pvpscore: 1,
        rname: 1,
        rno: 1,
        _power: 1
    }).sort(sort).skip(offset).limit(+limit);
    const items = await itemc.toArray();
    const total = await roleModel.count($match)
    items.forEach((item, index) => {
        item.rank = offset + index + 1;
        item.pvpscore = item.pvpscore || 0;
    })
    return {
        items: items,
        total: total
    }
};

