exports.name = '日报查询';
exports.type = 'I';
exports.inherit = 'analyze-ltvmenus';
const moment = require('moment');
const FORMAT = 'YYYY-MM-DD';
exports.exec = async function (body, query, ctx) {
    const {_page_, _sort_, servid, bundle, create_at} = body;
    const {limit, current} = _page_;

    const offset = (current - 1) * limit;
    const opt = {};

    if (servid && servid.length > 0) {
        const sArr = Array.isArray(servid) ? servid : [servid];
        opt.servid = {$in: sArr.map(s => +s)};
    } else {
        const servers = await this.service.game.serversOptions(ctx.adminRole);
        if (!servers.__is_all__)  // 被隔离了
            opt['servid'] = {
                $in: servers.map(s => s.value)
            }
    }

    if (bundle && bundle.length) {
        opt.bundle =   {$in: this.db.mongo.bundle.parseBundlesMatch(bundle) } ;
    }  else {
        const bundles = await this.db.mongo.bundle.getBundles(ctx.adminRole);
        if (!bundles.__is_all__)  opt.bundle = {$in: bundles}
    }

    if (create_at && create_at[0]) {
        opt.create_at = {
            $gte: create_at[0],
            $lte: create_at[1],
        };
    }

    console.log('debug opt ', opt);

    const sort = {};
    if (_sort_ && _sort_.field) {
        if (_sort_.field === 'create_at') {
            _sort_.field = '_id.create_at';
        }
        sort[_sort_.field] = _sort_.order;
    } else {
        sort['_id.create_at'] = -1;
    }
    const dallyModel = await this.service.game.collection('shapshoot_dallies');
    // .sort(sort).skip(offset).limit(+limit)
    const c = await dallyModel.aggregate([
        {$match: opt},
        {
            $group: {
                _id: {
                    servid: '$servid',
                    create_at: '$create_at'
                },
                create_at: {$first: '$create_at'},
                bundle: {
                    $addToSet: '$bundle'
                },
                registerCount: {$sum: "$registerCount"},
                rollRegister: {$sum: "$rollRegister"},
                rollPayCount: {$sum: "$rollPayCount"},
                rollPayTotal: {$sum: "$rollPayTotal"},
                activeCount: {$sum: '$activeCount'},
                payCount: {$sum: '$payCount'},
                payTotal: {$sum: '$payTotal'},
                registerPayCount: {$sum: '$registerPayCount'},
                registerPayTotal: {$sum: '$registerPayTotal'},
            }
        },
        {$sort: Object.assign({}, sort, {'_id.servid': 1})},
        {$skip: +offset},
        {$limit: +limit}
    ]);
    const items = await c.toArray();
    const totalCursor = await dallyModel.aggregate([
        {$match: opt},
        {
            $group: {
                _id: {
                    servid: '$servid',
                    create_at: '$create_at'
                },
                registerCount: {$sum: "$registerCount"},
                activeCount: {$sum: '$activeCount'},
                payCount: {$sum: '$payCount'},
                payTotal: {$sum: '$payTotal'},
                addPayCount: {$sum: '$addPayCount'},
                addPayTotal: {$sum: '$addPayTotal'},
                registerPayCount: {$sum: '$registerPayCount'},
                registerPayTotal: {$sum: '$registerPayTotal'},
            }
        },
        {
            $group: {
                _id: null,
                count: {$sum: 1},
                registerCount: {$sum: "$registerCount"},
                activeCount: {$sum: '$activeCount'},
                payCount: {$sum: '$payCount'},
                payTotal: {$sum: '$payTotal'},
                addPayCount: {$sum: '$addPayCount'},
                addPayTotal: {$sum: '$addPayTotal'},
                registerPayCount: {$sum: '$registerPayCount'},
                registerPayTotal: {$sum: '$registerPayTotal'},
            }
        }
    ]);
    const totalArr = await totalCursor.toArray();
    const total = totalArr[0] ? totalArr[0].count : 0;
    const totalExpend = [];
    if (totalArr[0]) {
        const t = totalArr[0];

        t.activePayRate = (t.payCount / (t.activeCount || 1) * 100).toFixed(2) + '%';
        t.arppu = (t.payTotal / (t.payCount || 1)).toFixed(2);
        t.arpu = (t.payTotal / (t.activeCount || 1)).toFixed(2);

        t.registerPayRate = (t.registerPayCount / (t.registerCount || 1) * 100).toFixed(2) + '%';
        t.registerPayArppu = (t.registerPayTotal / (t.registerPayCount || 1)).toFixed(2);
        t.registerArppu = (t.registerPayTotal / (t.registerCount || 1)).toFixed(2);

        totalExpend.push({
                title: '注册数',
                value: t.registerCount
            }, {
                title: '活跃数',
                value: t.activeCount
            }, {
                title: '付费数',
                value: t.payCount
            }, {
                title: '付费金额',
                value: t.payTotal
            }, {
                title: '活跃付费率',
                value: t.activePayRate
            },
            {
                title: '活跃ARPU',
                value: t.arpu
            },
            {
                title: '付费ARPPU',
                value: t.arppu
            }, {
                title: '注册付费数',
                value: t.registerPayCount
            }, {
                title: '注册付费率',
                value: t.registerPayRate
            }, {
                title: '注册付费总额',
                value: t.registerPayTotal
            }, {
                title: '注册付费ARPPU',
                value: t.registerPayArppu
            }, {
                title: '注册ARPU',
                value: t.registerArppu
            })
    }
    return {
        items: items.map(it => {
            it.create_at = it._id.create_at;
            it.servid = it._id.servid;
            it.bundle = it.bundle.join(' ');
            it.activePayRate = (it.payCount / (it.activeCount || 1) * 100).toFixed(2) + '%';
            it.arppu = (it.payTotal / (it.payCount || 1)).toFixed(2);
            it.arpu = (it.payTotal / (it.activeCount || 1)).toFixed(2);
            it.registerPayRate = (it.registerPayCount / (it.registerCount || 1) * 100).toFixed(2) + '%';
            it.registerPayArppu = (it.registerPayTotal / (it.registerPayCount || 1)).toFixed(2);
            it.registerArppu = (it.registerPayTotal / (it.registerCount || 1)).toFixed(2);
            return it;
        }),
        total,
        totalExpend
    }
};

