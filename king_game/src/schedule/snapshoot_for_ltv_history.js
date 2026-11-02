'use strict'

const moment = require("moment");
const FORMAT = "YYYY-MM-DD";
// 定时器
exports.name = "将(LTV+留存)快照成历史数据"; // 类似一句中文注释，后续后台可以展示该名字,

// 定时器语句 注意：要赶在删除登陆日志(loginlog)前分析<目前是每个月的15,16号3点，删除上个月的>
exports.cron = "0 33 2 15,16 * *"; // 每个月的15|16日的2点33分进行分析 

/**
 * @return {Promise<void>}
 */
exports.main = async function (body = {}) { // body 行参 时为了重置指定日期统计时用
    
    const endStr =  moment(body.date || new Date()).format(FORMAT);
    const startStr = moment(endStr).add(-1, 'month').format(FORMAT); // 比结束日期少1个月
    const ltvKeep = global.dao.shapshoot_ltv;
    const agg = [
        {
            $match: {
                date: {
                    $gt: startStr, // 大于开始日期
                    $lte: endStr // 小于等于结束日期
                }
            }
        },
        {
            $group: {
                _id: {
                    date: '$date',
                    bundle: '$bundle',
                    type: '$type',
                },
                roleCount: {
                    $sum: '$roleCount'
                },
                analyze: {
                    $push: '$analyze'
                }
            },
        }
    ];
    console.log('LTV_HISTORY Agg =', JSON.stringify(agg));
    let data = await ltvKeep.aggregate(agg);
    const end = moment(endStr).endOf('days');
    const start = moment(startStr).endOf('days');

    const roleModel = global.dao.role;
    const logModel = global.dao.loginlog;
    const _match = {
        'others.90222.count': {$gt: 0},
        create: {
            $gt: start.valueOf(), // 大于开始日期的最后时间
            $lte: end.valueOf()
        }
    };

    const role_agg = [
        {
            $match: _match
        },
        {
            $group: {
                _id: "$uid",
                create: {$min: "$create"},
                bundle: {$min: "$bundle"},
                uid: {$first: "$uid"}
            }
        },
        {
            $group: {
                _id: {
                    date: {
                        $dateToString: {
                            date: {$add: [new Date(0), '$create']},
                            format: '%Y-%m-%d',
                            timezone: global.TIMEZONE
                        }
                    },
                    bundle: '$bundle'
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
    console.log('LTV_HISTORY RoleAgg =', JSON.stringify(role_agg));
    // 获取查询日期范围内的付费玩家
    const payRoleCountArr = await roleModel.aggregate(role_agg);
    const payRoleTmp = {}; // 日期的付费玩家数
    const ayzKey = 'todayActive';

    //console.log('ltv history payRoleCountArr =', payRoleCountArr);
    const activeTmp = {}; // 日期的活跃玩家数
    for (const p of payRoleCountArr) {
        payRoleTmp[p._id.date] = payRoleTmp[p._id.date] || {}
        payRoleTmp[p._id.date][p._id.bundle] = p.roleCount;
        // 获取付费玩家的登录记录
        const ldata = await logModel.aggregate([
            {
                $match: {
                    uid: { $in: p.uids }
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
        activeTmp[p._id.date] = activeTmp[p._id.date] || {};
        activeTmp[p._id.date][p._id.bundle] = [];
        for (const log of ldata) {
            const d = moment(log._id).diff(moment(p._id.date), 'days');
            activeTmp[p._id.date][p._id.bundle][d] = {
                todayActive: log.count
            }
        }
    }
    
    for (const item of data) {
        let pTmp = payRoleTmp[item._id.date] || {}
        item.payCount = pTmp[item._id.bundle] || 0;
        let actTmp = activeTmp[item._id.date] || {};
        item.analyze = [actTmp[item._id.bundle] || [{todayActive: 0}]];

    }
    let items = data.map(item => {
        const {analyze, ...obj} = item;
        let runObj = {
            date: obj._id.date,
            bundle: obj._id.bundle,
            type: obj._id.type,
            servid: obj.servid || 0,
            roleCount: obj.roleCount,
            payCount: obj.payCount,
            ratioList: []
        }
        // 得到最长一条数据
        let maxCol = 0;
        analyze.forEach(a => maxCol = Math.max(a.length, maxCol));
        // 汇总数据
        for (let i = 0; i < maxCol; i++) {
            let actTotal = 0
            for (const a of analyze) {
                actTotal += (a[i] ? a[i][ayzKey] : 0);
            }

            runObj.ratioList[i] = {
                actTotal,
                ratio: +((actTotal * 100 / (runObj.payCount || 1)).toFixed(2))
            };
        }
        // let indexNum = moment(runObj.date).diff(moment(startStr), 'days');
        // for (const a of analyze) {
        //     runObj.actRoleCount += (a[indexNum] ? a[indexNum][ayzKey] : 0);                
        // }
        // runObj.ratio = +((runObj.actRoleCount * 100 / (runObj.roleCount || 1)).toFixed(2));
        // console.log('LTV_HISTORY runObj =', runObj)
        return runObj;
    })

    //console.log(JSON.stringify(items))
    // 保存数据库
    const r = await global.dao.snapshoot_ltv_history.insertMany(items);

    return r
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}
