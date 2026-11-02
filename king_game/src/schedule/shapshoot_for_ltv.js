'use strict'

const moment = require("moment");
const FORMAT = "YYYY-MM-DD";
// 定时器
exports.name = "数据分析(LTV+留存)"; // 类似一句中文注释，后续后台可以展示该名字,

// 定时器语句
exports.cron = "0 10 2 * * *"; // 每晚2点10分进行分析

/**
 * @return {Promise<void>}
 */
exports.main = async function (body = {}) { // body 行参 时为了重置指定日期统计时用


    const roleinfoModel = global.dao.role;
    // servid 默认过滤
    const filter = {
        servid: {
            $lt: 10000
        }
    }

    const whitelistModel = global.dao.whitelist;
    const whiteArr = await whitelistModel.find({}, {uid: 1}) ;
    const whitelist = {};
    whiteArr.map(w => whitelist[w.uid] = 1);

    const orderDefaultFilter = {
        confirm: {
            $gt: 0
        },
    };

    // orderDefaultFilter.coupon = { //  不要统计代金券订单时打开
    //     $ne: true
    // }

    const date = moment(body.date || new Date());

    if(!body.date) {
        date.add(-1, 'day'); // 回退到前一天(因为定时器是 次日跑的
    }

    const roleData = await roleinfoModel.aggregate([
        {
            $match: {
                create: {
                    $gte: date.startOf('day').valueOf(),
                    $lte: date.endOf('day').valueOf()
                },
                ...filter
            }
        },
        {
            $group: {
                _id: {
                    servid: '$servid',
                    bundle: '$bundle'
                },
                uid: {
                    $push: '$uid'
                }
            }
        }
    ]).option({
        allowDiskUse: true
    });

    const uidData = await roleinfoModel.aggregate([
        {
            $match: {
                ...filter
            }
        },
        {
            $group: {
                _id: "$uid",
                bundle: {
                    $first: "$bundle"
                },
                create: {
                    $min: "$create"
                },
                uid: {
                    $first: "$uid"
                }
            }
        },
        {
            $match: {
                create: {
                    $gte: date.startOf('day').valueOf(),
                    $lte: date.endOf('day').valueOf()
                }
            }
        },
        {
            $group: {
                _id: '$bundle',
                uid: {
                    $push: '$uid'
                }
            },
        }
    ]).option({
        allowDiskUse: true
    });

    const orderModel =  global.dao.order;
    const loginLogModel =  global.dao.loginlog;
    // 查今日新增付费人数
    const findAddPayCount = async (ids, servid) => {
        const match = {
            uid: {$in: ids.filter(id => !whitelist[id])},
            ...orderDefaultFilter
        };

        if (servid) {
            match.servid = servid;
        } else {
            Object.assign(match, filter)
        }

        let agg = [
            {
                $match: match
            },
            {
                $group: {
                    _id: '$uid',
                    create: {$first: '$create'},
                }
            },
            {
                $match: {
                    create: {
                        $gte: date.startOf('day').valueOf(),
                        $lte: date.endOf('day').valueOf()
                    }
                }
            },
            {
                $group: {
                    _id: null, count: {$sum: 1}
                }
            }
        ];
        const out = await orderModel.aggregate(agg);
        return out[0] ? out[0].count : 0;
    }

    // 订单总额
    const findAddPayTotal = async (ids, servid) => {

        const match = {
            uid: {$in: ids.filter(id => !whitelist[id])},
            create: {
                $gte: date.startOf('day').valueOf(),
                $lte: date.endOf('day').valueOf()
            },
            ...orderDefaultFilter
        };
        if (servid) {
            match.servid = servid;
        } else {
            Object.assign(match, filter);
        }
        let agg = [
            {
                $match: match
            },
            // lastout.price = ;
            {
                $group: {
                    _id: null,
                    price: {
                        $sum: {"$cond": {if: {$eq: ["$coupon", true]}, then: 0, else: "$price"}}
                    }
                }
            }
        ];
        const out = await orderModel.aggregate(agg);
        return out[0] ? out[0].price : 0;
    }

    // 查询活跃
    const findActiveTotal = async (ids, servid) => {
        const match = {
            uid: {$in: ids},
            date: {
                $gte: date.startOf('day').valueOf(),
                $lte: date.endOf('day').valueOf()
            }
        };

        if (servid) {
            match.servid = servid;
        } else {
            Object.assign(match, filter)
        }
        let agg = [
            {
                $match: match
            },
            {
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
                    },
                }
            },
            {
                $group: {
                    _id: null,
                    count: {$sum: 1}
                }
            }
        ];
        const out = await loginLogModel.aggregate(agg);
        return out[0] ? out[0].count : 0;
    }

    const ltvKeep = global.dao.shapshoot_ltv;
    for (const c of roleData) {
        const servid = +c._id.servid;
        const bundle = c._id.bundle;
        const addPayCount = await findAddPayCount(c.uid, servid);
        const addPayTotal = await findAddPayTotal(c.uid, servid);
        const todayActive = await findActiveTotal(c.uid, servid);

        const d = await ltvKeep.findOne({
            date: date.format(FORMAT),
            bundle,
            servid,
            type: 1 // 1 表示 角色汇总
        });
        if (d) {
            await ltvKeep.updateOne({
                _id: d._id
            }, {
                $set: {
                    ids: c.uid,
                    roleCount: c.uid.length,
                    update_at: new Date(),
                    'analyze.0': {
                        addPayCount,
                        addPayTotal,
                        todayActive
                    }
                },
            });
        } else {
            await ltvKeep.findOneAndUpdate({
                date: date.format(FORMAT),
                bundle,
                servid,
                type: 1 // 1 表示 角色汇总
            }, {
                $set: {
                    ids: c.uid,
                    roleCount: c.uid.length,
                    update_at: new Date(),
                    'analyze': [{
                        addPayCount,
                        addPayTotal,
                        todayActive
                    }]
                },
            }, {upsert: true});
        }
    }

    for (const c of uidData) {
        const bundle = c._id;
        const addPayCount = await findAddPayCount(c.uid, 0);
        const addPayTotal = await findAddPayTotal(c.uid, 0);
        const todayActive = await findActiveTotal(c.uid, 0);

        const d = await ltvKeep.findOne({
            date: date.format(FORMAT),
            bundle,
            type: 0 // 1 表示 角色汇总
        });
        if (d) {
            await ltvKeep.updateOne({
                _id: d._id
            }, {
                $set: {
                    ids: c.uid,
                    roleCount: c.uid.length,
                    update_at: new Date(),
                    'analyze.0': {
                        addPayCount,
                        addPayTotal,
                        todayActive
                    }

                },
            });
        } else {
            await ltvKeep.findOneAndUpdate({
                date: date.format(FORMAT),
                bundle,
                type: 0 // 0 表示 账号汇总
            }, {
                $set: {
                    ids: c.uid,
                    roleCount: c.uid.length,
                    update_at: new Date(),
                    'analyze': [{
                        addPayCount,
                        addPayTotal,
                        todayActive
                    }]
                },
            }, {upsert: true});
        }

    }

    const ltvData = await ltvKeep.find({
        date: {$lt: date.format(FORMAT)}
    });

    for (const ltv of ltvData) {
        const mDate = moment(ltv.date  ) ;
        const i = date.diff(mDate, 'day'); //
        // console.log('DIFF DATE', date, mDate, i);
        console.log('LTV 分析 ', ltv.date ,ltv.servid);
        const addPayCount = await findAddPayCount(ltv.ids, ltv.servid);
        console.log('LTV 分析 ', ltv.date , "addPayCount", addPayCount)
        const addPayTotal = await findAddPayTotal(ltv.ids, ltv.servid);
        console.log('LTV 分析 ', ltv.date , "addPayTotal", addPayTotal)
        const todayActive = await findActiveTotal(ltv.ids, ltv.servid);
        console.log('LTV 分析 ', ltv.date , "todayActive", todayActive)
        await ltvKeep.updateOne({
            _id: ltv._id
        }, {
            $set: {
                ids: ltv.ids,
                update_at: new Date(),
                ['analyze.' + i]: {
                    addPayCount,
                    addPayTotal,
                    todayActive
                }
            }
        });
    }

}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}
