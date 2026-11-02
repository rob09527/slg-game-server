const moment = require('moment');
exports.name = '分时看板查询';
exports.type = 'I';
exports.inherit = 'analyze-ltvmenus';
// 创建一个 看板数据的缓存区
global.BOARDH_CACHE = {};

exports.exec = async function (body, query, ctx) {

    const {servid, bundle, date, platform} = body;


    const cacheKey = ctx.adminRole + (Array.isArray(servid) ? servid.join(',') : servid) + (bundle ? JSON.stringify(bundle) : '') + platform + date;
    const now = Date.now();
    const cacheData = BOARDH_CACHE[cacheKey] || {time: 0};
    BOARDH_CACHE[cacheKey] = cacheData;
    if (cacheData && (now - cacheData.time) < 10000) {
        if (cacheData.data) {
            console.log('日报使用缓存 ---', servid)
            return cacheData.data;
        }
        console.log('日报等待缓存完成 ---', servid);
        cacheData.listener = cacheData.listener || [];
        const lis = () => new Promise((resolve, reject) => {
            cacheData.listener.push({resolve, reject});
        });
        const data = await lis();
        console.log('日报等待结束返回数据 ---', servid);
        return data;
    }

    const mongoDateFormat = (key) => {
        return {
            $dateToString: {
                date: {$add: [new Date(0), '$' + key]},
                format: '%Y-%m-%d %H:00:00',
                timezone: global.TIMEZONE
            }
        }
    }

    const loadData = async () => {
        const match = {};

        if (servid && servid !== 'ALL') {
            match.servid = Array.isArray(servid) ? {$in: servid.map(Number)} : +servid;
        } else {
            const servers = await this.service.game.serversOptions(ctx.adminRole);
            if (!servers.__is_all__)  // 被隔离了
                match['servid'] = {
                    $in: servers.map(s => s.value)
                }
        }
        if (platform && platform !== 'ALL') {
            match.platform = platform;
        }

        if (bundle && bundle !== 'ALL' && bundle.length) {
            match.bundle =  {$in: this.db.mongo.bundle.parseBundlesMatch(bundle) } ;
        }

        const NOW = moment(date || undefined);
        const start = NOW.startOf('d').valueOf();
        const end = NOW.endOf('d').valueOf();

        const role = await this.service.game.collection('roles');
        const roleMatch = Object.assign({create: {$gte: start, $lte: end}}, match);
        console.log('role match ', roleMatch)
        const cursor = await role.aggregate([
            {
                $match: roleMatch
            },
            {
                $group: {
                    _id: mongoDateFormat('create'),
                    registerCount: {
                        $sum: 1
                    }
                }
            }
        ]);

        const roleData = await cursor.toArray();
        const loginLog = await this.service.game.collection('loginlogs');

        const loginCursor = await loginLog.aggregate([
            {
                $match: {
                    ...match,
                    date: {$gte: start, $lte: end}
                }
            },
            {
                $group: {
                    _id: {
                        time: mongoDateFormat('date'),
                        uid: "$uid",
                        servid: "$servid"
                    },
                }
            },
            {
                $group: {
                    _id: "$_id.time",
                    activeCount: {
                        $sum: 1
                    }
                }
            }
        ]);

        const loginData = await loginCursor.toArray();

        const orderModel = await this.service.game.collection('orders');

        const whitelistModel = await this.service.game.collection('whitelists');
        const whitelistCursor = await whitelistModel.find({}, {uid: 1});
        const whitelist = (await whitelistCursor.toArray()).map(w => w.uid);
        match.uid = {
            $nin: whitelist
        }

        const orderCursor = await orderModel.aggregate([
            {
                $match: {
                    ...match,
                    coupon: {   // 忽略 代金劵订单
                        $ne: true
                    },
                    confirm: {$exists: true},
                    create: {$gte: start, $lte: end},
                }
            },
            {
                $group: {
                    _id: {
                        time: mongoDateFormat('create'),
                        uid: "$uid",
                        servid: "$servid"
                    },
                    price: {
                        $sum: '$price'
                    },
                    payCount: {
                        $sum: 1
                    }
                }
            },
            {
                $group: {
                    _id: '$_id.time',
                    payTotal: {
                        $sum: '$price'
                    },
                    payCount: {
                        $sum: '$payCount'
                    },
                    payRoleCount: {
                        $sum: 1
                    }
                }
            }
        ]);

        const _order_ = await orderCursor.toArray();

        const roleMap = {};
        const t = moment(start).format('YYYY-MM-DD');
        for (let i = 0; i < 24; i++) {
            const key = `${t} ${('0' + i).substr(-2)}:00:00`;
            roleMap[key] = {
                _id: key,
                registerCount: 0,
                activeCount: 0,
                payTotal: 0,
                payCount: 0,
                payRoleCount: 0,
            };
        }
        for (const item of roleData) {
            roleMap[item._id] = Object.assign(roleMap[item._id], item)
        }

        for (const item of loginData) {
            roleMap[item._id] = Object.assign(roleMap[item._id], item)
        }

        for (const item of _order_) {
            roleMap[item._id] = Object.assign(roleMap[item._id], item)
        }
        const outData = Object.keys(roleMap).sort().map(k => roleMap[k]);
        return outData;
    }
    const items = await loadData();

    cacheData.data = {
        items,
        total: items.length
    }
    cacheData.time = now;
    // 通知其他的访问也返回
    if (cacheData.listener) {
        for (const k in cacheData.listener) {
            const lis = cacheData.listener[k];
            if (!lis) {
                continue;
            }
            cacheData.listener[k] = null;
            lis.resolve(cacheData.data);
        }
    }

    return cacheData.data;
};

