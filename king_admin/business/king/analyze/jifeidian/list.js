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

    if (date && date[1]) {
        const [start, end] = this.parseDateMatch(date);
        // 两边数据表时间格式不一样， 分开 写条件
        $match.create = {
            $gte: start,
            $lte: end
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
    const sort = {};
    if (_sort_ && _sort_.field) {
        sort[_sort_.field] = _sort_.order;
    } else {
        sort.times = -1;
    }


    const orderModel = await this.service.game.collection('orders');
    const agg = [
        {
            $match
        },
        {
            $group: {
                _id: '$pid',
                times: {
                    $sum: 1
                },
                price: {
                    $sum: "$price"
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
                count: {$sum: 1},
                times: {
                    $sum: "$times"
                },
                price: {$sum: '$price'}
            }
        }
    ]);

    const t = await totalC.toArray();
    const {count = 0, times: totalTimes = 0, price: totalPrice = 0} = t[0] || {};
    const sppackList = await this.db.mongo.sppack.getSppacks();
    const tmp = {};
    sppackList.forEach(it => {
        tmp[it.value] = it.name;
    })
    return {
        items: items.map(item => {
            item.timeRate = (100 * item.times / totalTimes).toFixed(2) + '%';
            item.payRate = (100 * item.price / totalPrice).toFixed(2) + '%';
            item.pname = tmp[item._id];
            return item;
        }),
        total: count,
        totalExpend: [
            {title: '总次数', value: totalTimes},
            {title: '总金额', value: totalPrice},
        ]
    }
};

