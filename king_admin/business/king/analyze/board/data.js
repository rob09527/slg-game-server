const moment = require('moment');
exports.name = '看版数据';
exports.type = 'I';
exports.inherit = 'analyze-ltvmenus';
// 创建一个 看板数据的缓存区
global.BOARD_CACHE = {};

exports.exec = async function (body, query, ctx) {

    const { servid, channel: bundle, platform, coupon = false } = body;
    const cacheKey = ctx.adminRole + (Array.isArray(servid) ? servid.join(',') : servid) + bundle + platform + coupon;
    const now = Date.now();
    const cacheData = BOARD_CACHE[cacheKey] || { time: 0 };
    BOARD_CACHE[cacheKey] = cacheData;
    if (cacheData && (now - cacheData.time) < 10000) {

        if (cacheData.data) {
            console.log('日报使用缓存 ---', servid)
            return cacheData.data;
        }
        console.log('日报等待缓存完成 ---', servid);
        cacheData.listener = cacheData.listener || [];
        const lis = () => new Promise((resolve, reject) => {
            cacheData.listener.push({ resolve, reject });
        });
        const data = await lis();
        console.log('日报等待结束返回数据 ---', servid);
        return data;
    }

    cacheData.time = now;
    const loadData = async () => {
        const match = {};
        if (platform && platform !== 'ALL') {
            match.platform = platform;
        }
        if (servid) {
            match.servid = Array.isArray(servid) ? { $in: servid.map(Number) } : +servid;
        } else {
            const servers = await this.service.game.serversOptions(ctx.adminRole);
            if (!servers.__is_all__)  // 被隔离了
                match['servid'] = {
                    $in: servers.map(s => s.value)
                }
        }
        if (bundle && bundle !== 'ALL') {
            // match.bundle = bundle;
            match.bundle = { $in: this.db.mongo.bundle.parseBundlesMatch([bundle]) };
        } else {
            const bundles = await this.db.mongo.bundle.getBundles(ctx.adminRole);
            if (!bundles.__is_all__) match.bundle = { $in: bundles }
        }
        const NOW = moment();
        const start = NOW.startOf('d').valueOf();

        const role = await this.service.game.collection('roles');
        const roleMatch = Object.assign({}, match);
        let groupType = '$servid'; // 如果不分服查看 则设置 null

        const a = [
            {
                $match: {
                    ...roleMatch,
                    update: { $gte: start }
                }
            },
            {
                $group: {
                    _id: groupType,
                    registerCount: {
                        $sum: {
                            $switch: {
                                branches: [
                                    {
                                        "case": {
                                            "$and": [
                                                { $gte: ["$create", start] },
                                            ]
                                        },
                                        "then": 1
                                    }
                                ],
                                default: 0
                            }
                        }
                    },
                    registers: {
                        $push: {
                            $switch: {
                                branches: [
                                    {
                                        "case": {
                                            "$and": [
                                                { $gte: ["$create", start] },
                                            ]
                                        },
                                        "then": "$_id"
                                    }
                                ],
                                default: null
                            }
                        }
                    },
                    activeCount: {
                        $sum: {
                            $switch: {
                                branches: [
                                    {
                                        "case": {
                                            "$and": [
                                                { $gte: ["$update", start] },
                                            ]
                                        },
                                        "then": 1
                                    }
                                ],
                                default: 0
                            }
                        }
                    },
                }
            }
        ];

        const cursor = await role.aggregate(a);

        const data = await cursor.toArray();

        const registers = [];
        const userDataMap = {};
        for (const userData of data) {
            registers.push(...userData.registers.filter(Boolean).map(o => o + ''));
            userData.registers = undefined;
            userDataMap[userData._id] = userData;
        }

        const orderModel = await this.service.game.collection('orders');
        if (coupon) {
            // 忽略 代金劵订单
            match.coupon = {
                $ne: true
            }
        }
        const whitelistModel = await this.service.game.collection('whitelists');
        const whitelistCursor = await whitelistModel.find({}, { uid: 1 });
        const whitelist = (await whitelistCursor.toArray()).map(w => w.uid);
        match.uid = {
            $nin: whitelist
        }
        const _agg = [
            {
                $match: {
                    ...match,
                    price: { $gte: 0 },
                    confirm: { $exists: true },
                    create: { $gte: start },
                }
            },
            {
                $project: {
                    create: 1,
                    uid: 1,
                    rid: 1,
                    bundle: 1,
                    platform: 1,
                    servid: 1,
                    price: { "$cond": { if: { $eq: ["$coupon", true] }, then: 0, else: "$price" } },
                    add_pay: {
                        $switch: {
                            branches: [
                                {
                                    "case": {
                                        "$and": [
                                            { $in: ["$rid", registers] },
                                        ]
                                    },
                                    "then": '$price'
                                }
                            ],
                            default: 0
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$rid",
                    addPayTotal: {
                        $sum: '$add_pay'
                    },
                    orderCount: { $sum: 1 },
                    payTotal: { $sum: "$price" },
                    bundle: { "$first": "$bundle" },
                    platform: { "$first": "$platform" },
                    servid: { "$first": "$servid" }
                }
            },
            {
                $group: {
                    _id: groupType,
                    orderCount: { $sum: "$orderCount" },
                    payCount: { $sum: 1 },
                    orderTotalPrice: { $sum: "$payTotal" },
                    addPayTotal: { $sum: "$addPayTotal" },
                    addPayCount: {
                        $sum: { "$cond": { if: { $gt: ["$addPayTotal", 0] }, then: 1, else: 0 } }
                    }
                }
            }
        ]
        console.log(_agg[0].$match)

        const orderCursor = await orderModel.aggregate(_agg);
        const _order_ = await orderCursor.toArray();
        const outData = []; // 分服数据

        const totalData = {};

        const orderMap = {};
        for (const orderData of _order_) {
            orderMap[orderData._id] = orderData;
        }
        for (const sid in userDataMap) {
            orderMap[sid] = orderMap[sid] || {
                addPayCount: 0,
                addPayTotal: 0,
                orderCount: 0,
                orderTotalPrice: 0,
                payCount: 0
            };
            Object.assign(orderMap[sid], userDataMap[sid]);
        }

        for (const sid in orderMap) {
            const o = orderMap[sid];
            o.activeCount = o.activeCount || 0;
            o.registerCount = o.registerCount || 0;
            for (const k in o) {
                if (k === '_id') {
                    continue;
                }
                totalData[k] = totalData[k] || 0;
                totalData[k] += o[k]; // 分服展示的数据统计汇总
            }
            o.servid = sid == 'null' ? null : +sid;
            o.name = sid + '服';
            outData.push(o);
        }

        return {
            ...totalData,
            each: outData[0] && outData[0].servid ? outData : null, // 分服展示的看板模块数据

        }
    }
    let error;
    try {
        cacheData.data = await loadData();
    } catch (e) {
        error = e;
        BOARD_CACHE[cacheKey] = null; // 清掉本次无效缓存
    }

    // 通知其他的访问也返回
    if (cacheData.listener) {
        for (const k in cacheData.listener) {
            const lis = cacheData.listener[k];
            if (!lis) {
                continue;
            }
            cacheData.listener[k] = null;
            if (error) {
                lis.reject(error);
            } else {
                lis.resolve(cacheData.data);
            }
        }
    }
    return cacheData.data;
};

