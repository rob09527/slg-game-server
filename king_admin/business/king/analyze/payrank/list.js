const ObjectId = require('mongodb').ObjectId;
exports.name = '计费点分布查询';
exports.type = 'I';
exports.inherit = 'analyze-ltvmenus';


exports.exec = async function (body, query, ctx) {
    const {_page_, _sort_, bundle, date, servid} = body;
    const {limit, current} = _page_;

    const offset = (current - 1) * limit;

    const $match = {
        confirm: {$gt: 0}
    };

    if (bundle && bundle.length) {
        $match.bundle = {
            $in: this.db.mongo.bundle.parseBundlesMatch(bundle)
        };
    }

    if (servid && servid !== 'ALL') {
        $match.servid = +servid;
    } else {
        const servers = await this.service.game.serversOptions(ctx.adminRole);
        if (!servers.__is_all__)  // 被隔离了
            $match['servid'] = {
                $in: servers.map(s => s.value)
            }
    }

    if (date && date[1]) {
        const [start, end] = this.parseDateMatch(date);
        // 两边数据表时间格式不一样， 分开 写条件
        $match.create = {
            $gte: start,
            $lte: end
        };
    }

    const sort = {};
    if (_sort_ && _sort_.field) {
        sort[_sort_.field] = _sort_.order;
    } else {
        sort.price = -1;
    }


    const orderModel = await this.service.game.collection('orders');
    const agg = [
        {
            $match
        },
        {
            $group: {
                _id: '$rid',
                times: {
                    $sum: 1
                },
                servid: {
                    $first: "$servid"
                },
                price: {
                    $sum: "$price"
                },
                uid: {
                    $first: "$uid"
                },
                last_order: {
                    $last: "$create"
                }
            }
        }
    ];
    const itemc = await orderModel.aggregate([
        ...agg,
        {
            $sort: sort,
        },
        {
            $skip: offset
        },
        {
            $limit: +limit
        }
    ], {allowDiskUse: true});
    const items = await itemc.toArray();

    const totalC = await orderModel.aggregate([
        ...agg,
        {
            $group: {
                _id: null,
                count: {$sum: 1}
            }
        }
    ]);

    const t = await totalC.toArray();
    const {count = 0} = t[0] || {};
    const roleModel = await this.service.game.collection('roles');


    const cursor = await roleModel.find({_id: {$in: items.map(o => ObjectId(o._id))}}).project({
        rname: 1,
        _id: 1,
        update: 1,
        create: 1
    });
    const roles = await cursor.toArray();
    const tmp = {};
    for (const r of roles) {
        tmp[r._id] = r;
    }

    return {
        items: items.map(item => {
            item.rname = tmp[item._id] && tmp[item._id].rname;
            item.last_login = tmp[item._id] ? tmp[item._id].update : 0;
            item.role_create = tmp[item._id] ? tmp[item._id].create : 0;
            if (item.last_login < Date.now() - 7 * 24 * 3600000) {
                item.rname = `<span style="color: crimson">${item.rname}</span>`
            }
            return item;
        }),
        total: count
    }
};

