const ObjectId = require('mongodb').ObjectId;
exports.name = '角色封地查询';
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

    const buildProject = {
        rid: 1
    }
    const buildGroup = {
        _id: '$rid'
    };

    // 获取 id 数组
    for (const id of Object.keys(this.service.game.config.manor.UP_BUILDING)) {
        if (+id === 1) {
            continue;
        } // id 1 为府邸，不在这个表
        const buildingKey = `BUILDING_${id}`;
        buildProject[buildingKey] = {$cond: {if: {$eq: ["$id", +id]}, then: "$lv", else: 0}};
        buildGroup[buildingKey] = {$max: "$" + buildingKey};
    }

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
                create: 1,
                update: 1,
                ...util.getRoleVipAndExpAgg(this.service.game.config, {vip: 1})
            }
        },
        {
            $lookup: {
                from: "manorbuildings", // 关联封地表
                let: {role_id: "$_id"},
                pipeline: [
                    {$addFields: {"roleOID": {$toObjectId: "$rid"}}},
                    {$match: {$expr: {$eq: ["$roleOID", "$$role_id"]}}},
                    {$project: buildProject},
                    {$group: buildGroup}
                ],
                as: "build"
            },
        },
        {$unwind: "$build"},

    ];

    const $project = {
        rname: 1,
        servid: 1,
        uid: 1,
        bundle: 1,
        create: 1,
        update: 1,
        vip: 1,
        "BUILDING_1": "$manors.mlevel",
    };
    //  其他建筑也需要输出
    for (const key in buildGroup) {
        if (key === '_id') continue;
        $project[key] = "$build." + key;
    }
    // 关联府邸表
    agg.push({
            $lookup: {
                from: "manors",
                let: {role_id: "$_id"},
                pipeline: [
                    {$addFields: {roleOID: {$toObjectId: "$rid"}}},
                    {$match: {$expr: {$eq: ["$roleOID", "$$role_id"]}}},
                ],
                as: "manors"
            }
        },
        {
            $unwind: "$manors"
        },
        {
            $project: $project
        }
    );


    // console.log(JSON.stringify(agg));

    const itemc = await roleModel.aggregate([
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

    const totalC = await roleModel.aggregate([
        ...agg,
        {$group: {_id: null, count: {"$sum": 1}}}
    ]);

    const items = await itemc.toArray();
    const total = await totalC.toArray();
    return {
        items: items,
        total: total[0] ? total[0].count : 0
    }
};

