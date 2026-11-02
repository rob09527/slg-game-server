const moment = require("moment");
exports.name = 'LTV数据类型查询与快照';
exports.type = 'I';
exports.inherit = 'analyze-ltvmenus';


exports.exec = async function (body, query, ctx) {
    const {
        bundle,
        servid,
        date,
        _page_ = {},
        _sort_,
    } = body;

    const {limit = 10, current = 1} = _page_;
    const offset = _page_.offset || (current - 1) * limit;
    const ispayRole = query.pay || body.pay;
    const ayzId = query.id || body.id; // 统计类型
    const $match = {
        type: query.type ? +query.type : +body.type
    };
    if (bundle && bundle.length) {
        $match.bundle = {$in: this.db.mongo.bundle.parseBundlesMatch(bundle)};
    } else {
        const bundles = await this.db.mongo.bundle.getBundles(ctx.adminRole, true);
        if (!bundles.__is_all__) $match.bundle = {$in: bundles}
    }
    if (servid) {
        $match.servid = +servid;
    }
    if (date && date[1]) {
        $match.date = {
            $gte: date[0],
            $lte: date[1]
        }
    }

    const ltvKeep = await this.service.game.collection('shapshoot_ltvs');
    const agg = [
        {
            $match
        },
        {
            $group: {
                _id: '$date',
                roleCount: {
                    $sum: '$roleCount'
                },
                analyze: {
                    $push: '$analyze'
                }
            },
        },

    ]
    const sort = {};
    if (_sort_ && _sort_.field) {
        sort[_sort_.field] = _sort_.order;
    } else {
        sort._id = -1;
    }
    console.log('match is', JSON.stringify(agg));
    const c = await ltvKeep.aggregate([...agg,
        {$sort: sort},
        {
            $skip: offset
        },
        {
            $limit: +limit
        }]);
    const data = await c.toArray();
    const tc = await ltvKeep.aggregate([...agg, {$group: {_id: null, count: {$sum: 1}}}]);
    const t = await tc.toArray();
    const total = t[0] ? t[0].count : 0;
    const one = await ltvKeep.findOne({}, {update_at: 1});

    if (ispayRole && data.length) { // 查询付费角色数

        const end = moment(data[0]._id).endOf('d');
        const start = moment(data[data.length - 1]._id).startOf('d');

        const roleModel = await this.service.game.collection('roles');
        const {servid, bundle} = $match;
        const _match = {
            'others.90222.count': {$gt: 0},
            create: {
                $gte: start.valueOf(),
                $lte: end.valueOf()
            }

        };
        if (bundle) {
            _match.bundle = bundle;
        }

        const agg = [
            {
                $match: _match
            },
            {
                $group: {
                    _id: "$uid",
                    create: {$min: "$create"},
                    uid: {$first: "$uid"}
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            date: {$add: [new Date(0), '$create']},
                            format: '%Y-%m-%d',
                            timezone: global.TIMEZONE
                        }
                    },
                    roleCount: {
                        $sum: 1
                    },
                    uids: {
                        $push: "$uid"
                    }
                }
            }
        ];
        console.log('agg', JSON.stringify(agg));
        const rc = await roleModel.aggregate(agg);

        const payRoleCountArr = await rc.toArray();
        const payRoleTmp = {};
        let logModel;
        if (ayzId === 'todayActive') { // 留存统计 需要重新分析留存
            logModel = await this.service.game.collection('loginlogs');
        }
        const activeTmp = {};
        for (const p of payRoleCountArr) {
            payRoleTmp[p._id] = p.roleCount;
            if (logModel) { // 重新分析留存
                const c = await logModel.aggregate([
                    {
                        $match: {
                            uid: {$in: p.uids}
                        }
                    }, {
                        $group: {
                            _id: {
                                date: {
                                    $dateToString: {
                                        date: {$add: [new Date(0), '$date']},
                                        format: '%Y-%m-%d',
                                        timezone: global.TIMEZONE
                                    }
                                },
                                uid: '$uid'
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$_id.date",
                            count: {$sum: 1}
                        }
                    }
                ]);
                const ldata = await c.toArray();
                activeTmp[p._id] = [];
                for (const ldatum of ldata) {
                    const d = moment(ldatum._id).diff(moment(p._id), 'day');
                    activeTmp[p._id][d] = {
                        todayActive: ldatum.count
                    }
                }
                console.log('debug', p._id, ldata, activeTmp);
            }
        }

        for (const item of data) {
            item.createCount = item.roleCount;
            item.roleCount = payRoleTmp[item._id] || 0;
            if (logModel) {
                item.analyze = [activeTmp[item._id] || [{todayActive: 0}]];
            }
        }
    }


    const OUT_DATA = {
        items: data,
        time: one && one.update_at,
        total: total,

    };

    return OUT_DATA
}
