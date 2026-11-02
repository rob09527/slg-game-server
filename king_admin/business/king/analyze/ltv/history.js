const moment = require('moment');
exports.name = '查看付费账号留存历史记录';
exports.type = 'I';
exports.inherit = 'analyze-ltv-view';

exports.exec = async function (body, query, ctx) {

    const {
        bundle,
        date,
        servid,
        _page_ = {},
        _sort_,
    } = body;

    const {limit = 10, current = 1} = _page_;
    const offset = _page_.offset || (current - 1) * limit;
    const $match = {
        type: query.type ? +query.type : +body.type
    };
    if (bundle && bundle.length) {
        $match.bundle = {$in: this.db.mongo.bundle.parseBundlesMatch(bundle)};
    } else {
        const bundles = await this.db.mongo.bundle.getBundles(ctx.adminRole, true);
        if (!bundles.__is_all__) $match.bundle = {$in: bundles}
    }
    if (servid) {
        $match.servid = +servid;
    }
    if (date && date[1]) {
        $match.date = {
            $gte: date[0],
            $lte: date[1]
        }
    }

    const ltvHistoryKeep = await this.service.game.collection('snapshoot_ltv_histories');
    const agg = [
        {
            $match
        },
        {
            $group: {
                _id: {
                    date: '$date',
                },
                roleCount: {
                    $sum: '$roleCount'
                },
                payCount: {
                    $sum: '$payCount'
                },
                ratioList: {
                    $push: '$ratioList'
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
    const tmpAgg = [
        ...agg,
        {
            $sort: sort
        },
        {
            $skip: offset
        },
        {
            $limit: +limit
        }
    ];
    console.log('match tmpAgg is', JSON.stringify(tmpAgg));
    const c = await ltvHistoryKeep.aggregate(tmpAgg);
    const data = await c.toArray();
    const tc = await ltvHistoryKeep.aggregate([...agg, {$group: {_id: null, count: {$sum: 1}}}]);
    const t = await tc.toArray();
    const total = t[0] ? t[0].count : 0;
    const OUT_DATA = {
        items: data,
        total: total,
    };

    return OUT_DATA
};

