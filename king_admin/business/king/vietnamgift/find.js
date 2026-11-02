exports.name = '越南礼包码查询';
exports.type = 'I';
exports.inherit = 'whitelist-view';
const moment = require('moment');

exports.exec = async function (body, query, ctx) {
    const { _page_, _sort_ } = body;
    const { limit, current } = _page_;
    const offset = (current - 1) * limit;
    const opt = {};
    const sort = {};

    if (body.state && body.state !== "ALL") {
        opt.state = body.state
    }
    if (body.packageid) {
        opt.packageid = body.packageid
    }

    if (_sort_ && _sort_.field) {
        sort[_sort_.field] = _sort_.order;
    } else {
        sort._id = -1;
    }
    const whitelistModel = await this.service.game.collection('websaleconfigs');




    const agg = [

        {
            $match: opt
        },
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

    const cursor = await whitelistModel.aggregate(agg, { allowDiskUse: true });

    const items = (await cursor.toArray()).map(e => {
        e.items = JSON.stringify(e.items)
        let text = ''
        e.chineseitems?.forEach(element => {
            text += `道具:${element.gsid},作用:${element.describe},数量:${element.count} ;`
        });
        e.chineseitems = text
        if (e.state == 1) {
            e.state = '待审核'
        }
        if (e.state == 2) {
            e.state = '通过'
        }
        if (e.state == 3) {
            e.state = '驳回'
        }
        if (e.state == 4) {
            e.state = '下架'
        }
        return e
    });
    const total = await whitelistModel.countDocuments(opt);
    return {
        items: items,
        total
    }
};

