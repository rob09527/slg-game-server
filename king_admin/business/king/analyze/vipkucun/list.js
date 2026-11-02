const ObjectId = require('mongodb').ObjectId;
exports.name = 'VIP库存查询';
exports.type = 'I';
exports.inherit = 'analyze-ltvmenus';


exports.exec = async function (body, query, ctx) {
    const {_page_, _sort_, servid, bundle, create, update} = body;
    // const {limit, current} = _page_;
    // const offset = (current - 1) * limit;


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
            $in: this.db.mongo.bundle.parseBundlesMatch(bundle)
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
        sort._id = -1;
    }

    const opt = util.getRoleVipAndExpAgg(this.service.game.config, {vip: 1});
    const roleModel = await this.service.game.collection('roles');
    const gsids = [
        38006,
        38005,
        30015,
        30001,
        30011,
        30008,
        30009,
        30026,
        30006
    ];
    const groupOut = {};

    gsids.forEach(gsid => {
        const k = `${util.gsidType(gsid)}.${gsid}.count`;
        opt[k] = 1;
        groupOut[`gsid_${gsid}`] = {
            $avg: '$' + k
        }
    });

    const agg = [
        {
            $match
        },
        {
            $project: {
                ...opt,
                uid: 1,
                _id: 1,
                servid: 1
            }
        },
        {
            $group: {
                _id: '$vip',
                count: {
                    $sum: 1
                },
                ...groupOut
            }
        }
    ];
    const itemc = await roleModel.aggregate([
        ...agg,
        {
            $sort: sort,
        }
    ], {allowDiskUse: true});
    const items = await itemc.toArray();
    items.forEach(item => {
        for (const gsid of gsids) {
            const k = `gsid_${gsid}`;
            item[k] = item[k] || 0;
            if (item[k] > 100000) {
                item[k] = (item[k] / 10000).toFixed(2) + "W";
            } else {
                item[k] = item[k].toFixed(0);
            }
        }
    })
    return {
        items: items,
        total: items.length
    }
};

