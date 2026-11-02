const ObjectId = require('mongodb').ObjectId;
exports.name = '排位赛排行查询';
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
        sort['kingpvp.l0'] = -1;
        sort['kingpvp.l1'] = -1;
        sort['kingpvp.star'] = -1;
    }

    const pvpkingModel = await this.service.game.collection('pvpkings');

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
            $limit: +limit
        },
        {
            $lookup: {
                from: "roles", // 关联角色
                let: {role_id: {$toObjectId: "$rid"}},
                pipeline: [
                    {$match: {$expr: {$eq: ["$_id", "$$role_id"]}}},
                    {
                        $project: {
                            servid: 1,
                            rname: 1,
                            rno: 1
                        }
                    },
                ],
                as: "role"
            },
        },
        {$unwind: "$role"},

    ];
    const itemc = await pvpkingModel.aggregate(agg, {allowDiskUse: true});

    const items = await itemc.toArray();
    const total = await pvpkingModel.count($match);
    const rankMap = {};
    for (const o of this.service.game.config.pvpkingrank) {
        rankMap[o.ID] = o.NAME;
    }

    items.forEach((item, index) => {
        item.rank = offset + index + 1;
        item.kingpvp = item.kingpvp || {};
        item.lv_id = (((item.kingpvp.l0 || 0) + 1) * 100) + (item.kingpvp.l1 || 0);
        item.lv_name = rankMap[item.lv_id];
        item.star = item.kingpvp.star || 0;
    })
    return {
        items: items,
        total: total
    }
};

