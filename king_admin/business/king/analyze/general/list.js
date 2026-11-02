const ObjectId = require('mongodb').ObjectId;
exports.name = '武将分布查询';
exports.type = 'I';
exports.inherit = 'analyze-ltvmenus';


exports.exec = async function (body, query, ctx) {
    const {_page_, _sort_, servid, bundle, create, update} = body;
    // const {limit, current} = _page_;
    // const offset = (current - 1) * limit;


    const $match = {
        "hide.38003.count": {"$gt": 20}
    };
    throw '功能废弃';
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
    const agg = [
        {
            $match
        },
        {
            $project: {
                rname: 1,
                uid: 1,
                _id: 1,
                ...opt
            }
        },
        {
            $lookup: {
                from: "generals", // 关联封地表
                let: {role_id: "$_id"},
                pipeline: [
                    {$addFields: {"roleOID": {$toObjectId: "$rid"}}},
                    {$match: {$expr: {$eq: ["$roleOID", "$$role_id"]}}},
                    {
                        $project: {
                            level: 1,
                            gsid: 1,
                            sort_gsid: {
                                $divide: [{
                                    $subtract: [{$subtract: ['$gsid', 1]}, {
                                        $mod: [{$subtract: ['$gsid', 1]}, 10]
                                    }]
                                }, 10]
                            }
                        }
                    },
                    {$sort: {level: -1}}
                ],
                as: "generals"
            },

        },
        {
            $project: {
                generals: {$slice: ['$generals', 0, 10]},
                hide: 1,
                uid: 1,
                rname: 1,
                vip: 1
            }
        },
        {
            $unwind: "$generals"
        },
        {
            $group: {
                _id: {
                    sort_gsid: "$generals.sort_gsid",
                    vip: "$vip"
                },
                count: {
                    $sum: 1
                }
            }
        },
        {
            $group: {
                _id: "$_id.sort_gsid",
                vip_agg: {
                    $push: {
                        vip: "$_id.vip",
                        count: "$count"
                    }
                }
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
    const showVip = [3, 15];
    for (const item of items) {
        const gsid = Math.floor(item._id * 10 + 1);
        item.gname = this.service.game.config.generalname[gsid];
        const tmp = {};
        for (const v of item.vip_agg) {
            tmp[v.vip] = tmp[v.vip] || 0;
            tmp[v.vip] += v.count;
        }
        for (let i = showVip[0]; i <= showVip[1]; i++) {
            item['vip' + i] = tmp[i] || 0;
        }
    }


    return {
        items: items,
        total: items.length
    }
};

