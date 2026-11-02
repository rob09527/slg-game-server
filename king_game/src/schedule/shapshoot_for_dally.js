'use strict'

const moment = require("moment");
const FORMAT = "YYYY-MM-DD";
// 定时器
exports.name = "数据分析(运营日报)"; // 类似一句中文注释，后续后台可以展示该名字,

// 定时器语句
exports.cron = "0 30 2 * * *"; // 每晚2点30分进行分析

/**
 * @return {Promise<void>}
 */
exports.main = async function (body = {}) { // body 行参 时为了重置指定日期统计时用

    const now = body.date || new Date();
    const NOW = moment(now);
    if(!body.date) {
        NOW.add(-1, 'day'); // 回退到前一天(因为定时器是 次日跑的
    }
    const whitelistModel = global.dao.whitelist;

    const whitelistCursor = await whitelistModel.find({}, {uid: 1});
    const whitelist = whitelistCursor.map(w => w.uid);

    const orderDefaultFilter = {
        confirm: {
            $gt: 0
        },
        uid: { // 不统计白名单
            $nin: whitelist
        }
    };
    if (this.channel_group === 'krkaihei') { // 韩服运营 强制不要统计代金券订单
        orderDefaultFilter.coupon = {
            $ne: true
        }
    }

    const today = [NOW.startOf('d').valueOf(), NOW.endOf('d').valueOf()];

    const defaultFilter = {
        servid: {
            $lt: 19000
        }
    };

    const roleInfoModel = global.dao.role;
    const loginModel = global.dao.loginlog;
    const rollAgg =  [
        {$sort: {_id: 1}},
        {
            $group: {
                _id: '$uid',
                role: {
                    $push: {
                        "servid": "$servid",
                        "rid": "$_id",
                        "create": "$create"
                    }
                }
            }
        },
        {
            $project :{

                role: {$slice: ['$role', 1,  9999]}
            }
        },
        {
            $unwind: "$role"
        },
        {$match: {'role.create':   {$gte: today[0], $lte:  today[1] } }},

        {
            $group: {_id: '$role.servid', rids: {$push: '$role.rid'}}
        }
    ];

    // 查出所有滚服号
    const rollRoles = await roleInfoModel.aggregate(rollAgg);

    // const rollRoles = [];
    console.log('ROLL END', rollRoles.length);

    const allRollRolesRid = [];
    // 查出所有滚服的 rid
    rollRoles.forEach(r => {
        allRollRolesRid.push(...r.rids);
    });


    // 查询活跃
    const loginData = await loginModel.aggregate([
        {
            $match: {...defaultFilter, date: {$gte: today[0], $lte: today[1]}}
        },
        {
            $group: {
                _id: {
                    bundle: "$bundle",
                    servid: "$servid",
                    uid: "$uid"
                },
                date: {
                    "$first": "$date"
                }
            }
        },
        {
            $project: {
                date: 1, uid: "$_id.uid", bundle: "$_id.bundle", servid: "$_id.servid"
            }
        },
        {
            $group: {
                _id: {
                    bundle: "$bundle",
                    servid: "$servid"
                },
                activeCount: {
                    $sum: 1
                }
            }
        }
    ]);

    console.log('ANALYZE ROLE LOGIN END', loginData.length);
    // 查询注册数据
    const roleRegister = await roleInfoModel.aggregate([
        {
            $match: {...defaultFilter, create: {$gte: today[0], $lte: today[1]}}
        },
        {
            $group: {
                _id: {
                    bundle: "$bundle",
                    servid: "$servid",
                },
                rids: {
                    $push: '$_id'
                },
                registerCount: {
                    $sum: 1
                },
                rollRegister: {
                    $sum: {
                        $switch: {
                            branches: [
                                {
                                    "case": {
                                        "$in": [
                                            "$_id",
                                            allRollRolesRid
                                        ]
                                    },
                                    "then": 1
                                }
                            ],
                            default: 0
                        }
                    }
                }

            }
        }
    ]);


    console.log('ANALYZE ROLE REGISTER END', roleRegister.length);

    const mapData = {};


    // 绑定活跃数据
    for (const a of loginData) {
        const _key = `${a._id.servid}${a._id.bundle}`;
        mapData[_key] = Object.assign(mapData[_key] || {...a._id}, {
            activeCount: a.activeCount,
            registerCount: 0,
            rollRegister: 0
        });
    }
    const registerRids = []; // 今日注册用户的 rid
    // 绑定注册统计数据
    for (const a of roleRegister) {
        const _key = `${a._id.servid}${a._id.bundle}`;
        mapData[_key] = Object.assign(mapData[_key] || {...a._id}, {
            registerCount: a.registerCount,
            rollRegister: a.rollRegister
        });
        registerRids.push(...a.rids.map(_ => _ + ''));
    }

    const orderModel = global.dao.order;

    const aggregateOrders = async (othersMatch = {}, no_register) => {
        const agg = [
            {
                $match: {
                    ...defaultFilter,
                    price: {$gte: 0},
                    ...orderDefaultFilter,
                    create: {$gte: today[0], $lte: today[1]},
                    ...othersMatch
                }
            },
            {
                $project: {
                    create: 1,
                    uid: 1,
                    rid: 1,
                    bundle: 1,
                    platform: 1,
                    price: {"$cond": {if: {$eq: ["$coupon", true]}, then: 0, else: "$price"}},
                    servid: 1
                }
            },
            {
                $group: {
                    _id: {
                        rid: "$rid",
                        servid: "$servid"
                    },
                    payTotal: {$sum: "$price"},
                    bundle: {"$first": "$bundle"},
                    platform: {"$first": "$platform"}
                }
            },
            {
                $group: {
                    _id: {
                        bundle: "$bundle",
                        servid: "$_id.servid"
                    },
                    payCount: {$sum: 1},
                    payTotal: {$sum: "$payTotal"},
                    registerPayCount: no_register ? {$sum: 0} : { // no_register 表示不查询注册相关数据
                        $sum: {
                            "$cond": {
                                "if": {
                                    "$in": [
                                        "$_id.rid",
                                        registerRids
                                    ]
                                },
                                "then": 1,
                                "else": 0
                            }
                        }
                    },
                    registerPayTotal: no_register ? {$sum: 0} : {
                        $sum: {
                            "$cond": {
                                "if": {
                                    "$in": [
                                        "$_id.rid",
                                        registerRids
                                    ]
                                },
                                "then": "$payTotal",
                                "else": 0
                            }
                        }
                    }
                }
            }
        ];
        console.log("ORDER AGG ", JSON.stringify(agg));
        // 查询支付数据
        const data = await orderModel.aggregate(agg);
        return data;
    }
    console.log("LOAD ALL ORDERS");
    // 查询 所有订单
    const orderData = await aggregateOrders();
    for (let a of orderData) {
        const key = `${a._id.servid}${a._id.bundle}`;
        const item = mapData[key] || {...a._id, ...a};
        item.payCount = a.payCount;
        item.payTotal = a.payTotal;
        item.registerPayCount = a.registerPayCount;
        item.registerPayTotal = a.registerPayTotal;

        mapData[key] = item;
    }
    console.log("LOAD ROLL ORDERS");
    // 查询滚服用户产生的订单
    const rollOrderData = await aggregateOrders({rid: {$in: allRollRolesRid.map(_id => '' + _id)}}, true);

    for (let a of rollOrderData) {
        const key = `${a._id.servid}${a._id.bundle}`;
        const item = mapData[key] || {...a._id};
        item.rollPayCount = a.payCount;
        item.rollPayTotal = a.payTotal;
        mapData[key] = item;
    }

    const date_key = NOW.format(FORMAT);
    console.log("DEBUG DATA", mapData);
    Object.values(mapData).forEach(a => {
        a.servid = +a.servid;
        a.create_at = date_key;
        delete a._id;
    });
    // 避免统计数据生成重复，保证可以重复执行
    await global.dao.shapshoot_dally.deleteMany({
        create_at: date_key
    });

    const r = await global.dao.shapshoot_dally.insertMany(Object.values(mapData));

    return r
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}
