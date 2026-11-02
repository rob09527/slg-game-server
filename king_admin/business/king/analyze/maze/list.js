const ObjectId = require('mongodb').ObjectId;
exports.name = '夺宝统计查询查询';
exports.type = 'I';
exports.inherit = 'analyze-ltvmenus';


exports.exec = async function (body, query, ctx) {
    const {_page_, _sort_, servid, bundle, create, update} = body;
    const {limit, current} = _page_;
    const offset = (current - 1) * limit;


    const $match = {};

    if (servid && servid !== 'ALL') {
        $match['servid'] = Number.parseInt(servid);
    } else {
        const servers = await this.service.game.serversOptions(ctx.adminRole);
        if (!servers.__is_all__)  // 被隔离了
            $match['servid'] = {
                $in: servers.map(s => s.value)
            }
    }

    if (bundle && bundle.length) {
        $match['bundle'] = {
            $in: this.db.mongo.bundle.parseBundlesMatch(bundle)
        };
    }

    if (create && create[1]) {
        const [start, end] = this.parseDateMatch(create);
        // 两边数据表时间格式不一样， 分开 写条件
        $match['create'] = {
            $gte: start,
            $lte: end
        };
    }

    if (update && update[1]) {
        const [start, end] = this.parseDateMatch(update);
        // 两边数据表时间格式不一样， 分开 写条件
        $match['update'] = {
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


    const roleModel = await this.service.game.collection('roles'); //

    const agg = [
        {
            $match
        },
        {
            $project: {
                rname: 1,
                servid: 1,
                uid: 1,
                bundle: 1,
                _id: 1
            }
        },
        {
            $lookup: {
                from: "mazechapters", // 关联远征表
                let: {role_id: "$_id"},
                pipeline: [
                    {$addFields: {"roleOID": {$toObjectId: "$rid"}}},
                    {$match: {$expr: {$eq: ["$roleOID", "$$role_id"]}}},
                    {
                        $project: {
                            gateid: "$gateid",
                            finish_status: {
                                $cond: {
                                    if: {$gt: ["$finish", 0]},
                                    then: 1,
                                    else: 0
                                }
                            }
                        }
                    }
                ],
                as: "maze"
            },
        },
        {$unwind: "$maze"},
        {
            $group: {
                _id: "$maze.gateid",
                mazechapters_count: {
                    $sum: 1
                },

                finish_count: {
                    $sum: "$maze.finish_status"
                }
            }
        },
    ];

    // console.log(JSON.stringify(agg));

    const itemc = await roleModel.aggregate([
        ...agg,
    ], {allowDiskUse: true});


    const items = await itemc.toArray();
    let totalCount = 0;
    items.forEach(item => {
        item.fail_count = item.mazechapters_count - item.finish_count;
        totalCount += item.mazechapters_count;
        item.finish_rate = (100 * item.finish_count / item.mazechapters_count).toFixed(2) + "%";
    });
    items.map(item => {
        item.un_rolecount = totalCount - item.mazechapters_count;
    });
    const out = items.filter(item => item._id);
    return {
        items: out,
        total: out.length
    }
};

