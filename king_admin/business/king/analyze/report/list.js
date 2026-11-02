exports.name = '运营报告查询';
exports.type = 'I';
exports.inherit = 'analyze-ltvmenus';
const moment = require('moment');
const FORMAT = 'YYYY-MM-DD';
const CACHE = {};
exports.exec = async function (body, query, ctx) {
    const {_page_, _sort_, bundle, date} = body;
    const {limit, current} = _page_;

    const offset = (current - 1) * limit;

    const $match = {};

    if (bundle && bundle.length) {
        $match.bundle = {
            $in: this.db.mongo.bundle.parseBundlesMatch(bundle)
        };
    } else {
        const bundles = await this.db.mongo.bundle.getBundles(ctx.adminRole, true);
        if (!bundles.__is_all__)  $match.bundle = {$in: bundles}
    }

    const ltvKeep = await this.service.game.collection('shapshoot_ltvs');

    const ltvMatch = {...$match, type: 0};
    if (date && date[1]) {
        // 两边数据表时间格式不一样， 分开 写条件
        ltvMatch.date = {
            $gte: date[0],
            $lte: date[1]
        };
    }

    const agg = [
        {
            $match: ltvMatch
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

    const ltvc = await ltvKeep.aggregate([...agg,
        {$sort: sort},
        {
            $skip: offset
        },
        {
            $limit: +limit
        }]);

    const data = await ltvc.toArray();
    /**
     * 封装取 某天的数据
     * @param analyzeData {[]}
     * @param key {string} 属性 key ,addPayCount:注册付费数, addPayTotal: 付费总金额, todayActive: 活跃数
     * @param day {number} 第几天, 0 ： 当天, 1: 次日， 2：第3天
     * @return number
     */
    const getAnalyzeCount = (analyzeData, key, day) => {
        return analyzeData.reduce((last, cur) => last + (cur[day] ? (cur[day][key] || 0) : 0), 0);
    }

    if (date && date[1]) {
        // 两边数据表时间格式不一样， 分开 写条件
        $match.create_at = {
            $gte: date[0],
            $lte: date[1] ,
        };
    }
    const dallyModel = await this.service.game.collection('shapshoot_dallies');
    // 日报数据
    const riBaoDataC = await dallyModel.aggregate([
        {$match},
        {
            $group: {
                _id: "$create_at",
                registerCount: {$sum: "$registerCount"},
                activeCount: {$sum: '$activeCount'},
                payCount: {$sum: '$payCount'},
                payTotal: {$sum: '$payTotal'},
            }
        },
        {
            $sort: sort
        },
        {
            $skip: Math.max(offset - 1, 0) // 第一条数据为固定今日
        },
        {
            $limit: +limit
        }
    ]);

    const riBaoData = await riBaoDataC.toArray();

    const ribaoTotalC = await dallyModel.aggregate([
        {$match},
        {
            $group: {
                _id: "$create_at",
                registerCount: {$sum: "$registerCount"},
                activeCount: {$sum: '$activeCount'},
                payCount: {$sum: '$payCount'},
                payTotal: {$sum: '$payTotal'},
            }
        }, {$group: {_id: null, count: {$sum: 1}}}]);
    const t = await ribaoTotalC.toArray();
    const total = 1 + (t[0] ? t[0].count : 0);

    // 日报数据转换为以 日期为 key 方便整合
    const ribaoMap = {};
    for (const it of riBaoData) {
        ribaoMap[it._id] = it;
    }
    const reportMap = {};
    for (const it of data) {
        reportMap[it._id] = it;
    }

    // 分享当日 实时数据, 并忽略查询实时数据报错
    const NOW = moment();
    const TODAY_KEY = NOW.format(FORMAT);
    // 查询条件包含今天时，才查询实时数据
    if (offset === 0 && (!ltvMatch.date || (ltvMatch.date.$gte <= TODAY_KEY && TODAY_KEY <= ltvMatch.date.$lte))) {

        try {
            const start_day = NOW.startOf('day').valueOf();
            const todayObj = {};
            const roleInfoModel = await this.service.game.collection( 'roles');
            const _channel_match_ = {};
            if ( $match.bundle){
                _channel_match_.bundle = $match.bundle;
            }
            // 实时注册数
            todayObj.registerCount = await roleInfoModel.count({create: {$gte: start_day} , ..._channel_match_});
            // 实时活跃数
            todayObj.activeCount = await roleInfoModel.count({update: {$gte: start_day}, ..._channel_match_});

            // 统计实时流水
            const orderModel = await this.service.game.collection('orders');
            const _match = {price: {$gt: 0},   confirm: {$exists: true}, create: {$gte: start_day}, ..._channel_match_};
            const whitelistModel = await this.service.game.collection('whitelists');
            const whitelistCursor = await whitelistModel.find({}, {uid: 1}) ;
            const whitelist = (await whitelistCursor.toArray()).map(w => w.uid);
            _match.uid = {
                $nin: whitelist
            }
            const _od_cursor = await orderModel.aggregate([
                {
                    $match: _match
                },
                {
                    $group: {
                        _id: "$rid",
                        price: {
                            $sum: {"$cond": {if: {$eq: ["$coupon", true]}, then: 0, else: "$price"}}
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        count: {
                            $sum: 1,
                        },
                        price: {
                            $sum: {"$cond": {if: {$eq: ["$coupon", true]}, then: 0, else: "$price"}}
                        }
                    }
                }
            ]);
            const _od = await _od_cursor.toArray();
            todayObj.payTotal = _od[0] ? _od[0].price : 0;
            todayObj.payCount = _od[0] ? _od[0].count : 0;
            todayObj._id = TODAY_KEY;
            todayObj.date_alias = '当日实时';
            ribaoMap[TODAY_KEY] = todayObj;

        } catch (e) {
            console.error('aya report real_time error', e);
            ribaoMap[TODAY_KEY] = {
                _id: TODAY_KEY,
                date_alias: '当日实时',
                registerCount: '统计出错',
                activeCount: '统计出错',
                payTotal: '统计出错',
                payCount: '统计出错'
            }
        }
        riBaoData.unshift(ribaoMap[TODAY_KEY] );
    }


    const items = riBaoData.map(ribao  => {
        const it = reportMap[ribao._id] || {
            _id: ribao._id,
        };
        const allAnalyze = it.analyze || []; // 拿到所有渠道的 统计数据
        const roleCount = it.roleCount || 1; // 注册人数,默认1，避免分母为0
        const maxLength = Math.max(...allAnalyze.map(a => a.length)); // 取出最长天数的统计数据
        const registerPayRate0 = getAnalyzeCount(allAnalyze, 'addPayCount', 0) / roleCount;
        const payTotalList = [];
        let payTotal = 0;
        // 只分析90天内数据ltv
        for (let i = 0; i < maxLength; i++) {
            payTotal += getAnalyzeCount(allAnalyze, 'addPayTotal', i);
            payTotalList[i] = payTotal;
        }
        const show = [2, 3, 7, 14 ,21, 30, 60 , 90]; // 展示 次日，3日 7日等数据分析
        ribao = ribao || {registerCount: 0, payTotal: 0, activeCount: 0, payCount: 0};
        const outObj = {
            date: ribao.date_alias || it._id,
            registerCount: it.roleCount || 0,
            registerPayRate0: (registerPayRate0 * 100).toFixed(2) + "%",
            ltv0: payTotalList[0] ? (payTotalList[0] / roleCount).toFixed(2) : 0,

            // 日报数据
            registerRoleCount: ribao.registerCount,
            payTotal: ribao.payTotal,
            activeCount: ribao.activeCount,
            payCount: ribao.payCount,
            payRate: (100 * ribao.payCount / (ribao.activeCount || 1) ).toFixed(2) + '%',
            activeArpu: ( ribao.payTotal / (ribao.activeCount || 1) ).toFixed(2) ,
            payArpu: ( ribao.payTotal / (ribao.payCount || 1) ).toFixed(2) ,
        };

        for (const day of show) {
            if (payTotalList[day - 1] === undefined) {
                continue;
            }
            outObj[`ltv${day}`] = (payTotalList[day - 1] / roleCount).toFixed(2);
            outObj[`activeRate${day}`] = (100 * getAnalyzeCount(allAnalyze, 'todayActive', day - 1) / roleCount).toFixed(2) + "%";
        }
        outObj[`ltvlast`] = payTotalList[payTotalList.length - 1]  ? (payTotalList[payTotalList.length - 1] / roleCount ).toFixed(2) : 0;
        return outObj;
    });

    const one = await ltvKeep.findOne({}, {ids: 0});

    return {
        items: items,
        total,
        time: one && one.update_at,
    }
};

