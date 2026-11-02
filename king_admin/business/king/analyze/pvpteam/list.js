const ObjectId = require('mongodb').ObjectId;
exports.name = '组队赛查询';
exports.type = 'I';
exports.inherit = 'analyze-ltvmenus';


exports.exec = async function (body, query, ctx) {
    const {_page_, _sort_, servid} = body;
    const {limit, current} = _page_;
    const offset = (current - 1) * limit;


    const $match = {};

    if (servid && servid !== 'ALL') {
        $match.servid = {$in: servid.split(',').map(Number)};
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
        sort['score'] = -1;
        sort['power'] = -1;
    }

    const pvpteamModel = await this.service.game.collection('pvpteams');

    const agg = [
        {
            $match
        },
        {
            $sort: sort
        },
        {
            $skip: offset
        },
        {
            $limit: +limit   // 先走limit 管道 后关联角色表（减少无用数据关联
        },
        {
            $unwind: "$fellows", // 先打开 数组字段在关联
        },
        {

            $lookup: {
                from: "roles", // 关联角色
                let: {role_id: {$toObjectId: "$fellows.rid"}},
                pipeline: [
                    {$match: {$expr: {$eq: ["$_id", "$$role_id"]}}},
                    {
                        $project: {
                            servid: 1,
                            rname: 1,
                            rno: 1,
                            uid: 1,
                            _power: 1
                        }
                    },
                ],
                as: "role"
            },

        },
        {$unwind: "$role"},
        {
            $project: {
                name: 1,
                score: 1,
                power: 1,
                servid: 1,
                role: {
                    uid: "$role.uid",
                    rno: "$role.rno",
                    name: "$role.rname",
                    power: "$role._power",
                    leader: "$fellows.leader"
                }

            }
        },
        {
            $group: {
                _id: "$_id",
                servid: {$first: "$servid"},
                name: {$first: "$name"},
                score: {$first: "$score"},
                power: {$first: "$power"},
                role: {$push: "$role"},
            }
        },
        {
            $sort: sort
        }
    ];
    // console.log(JSON.stringify(agg));
    const itemc = await pvpteamModel.aggregate(agg, {allowDiskUse: true});

    const items = await itemc.toArray();
    const total = await pvpteamModel.count($match);

    items.forEach((item, index) => {
        item.rank = offset + index + 1;
        for (const r of item.role) {
            if (r.leader) {
                // 队长
                item.leader = r;
            } else {
                if (item.member1) {
                    item.member2 = r;
                } else {
                    item.member1 = r;
                }
            }
        }
        item.role = undefined;
    })
    return {
        items: items,
        total: total
    }
};

