exports.name = '越南订单数据查询';
exports.type = 'I';
exports.inherit = 'order-view';
const moment = require('moment');
exports.exec = async function (body, query, ctx) {
    const {
        _page_,
        _sort_,
        _export_,
        serverid: servid,
        uid,
        pid,
        create,
        oid,
        bundle,
        today,
        ignore,
        ignore_old,
        type,
        state,
        packageid,
        ...othersOpt
    } = body;
    const { limit, current } = _page_;
    console.error(JSON.stringify(body))
    const offset = (current - 1) * limit;
    let opt = { type: 'yn' };
    if (servid && servid !== 'ALL') {
        opt['data.serverid'] = Number.parseInt(servid);
    } else {
        const servers = await this.service.game.serversOptions(ctx.adminRole);
        if (!servers.__is_all__)  // 被隔离了
            opt['data.servid'] = {
                $in: servers.map(s => s.value)
            }
    }

    const orderModel = await this.service.game.collection('websales');

    if (oid) { // 查询订单号时，查询第三方订单号和 本地订单号
        opt = { tranid: oid };
    } else {
        for (let k in othersOpt) {
            if (othersOpt[k] && othersOpt[k] !== 'ALL') {
                opt[k] = othersOpt[k];
            }
        }

        if (create && create[1]) {
            const [start, end] = this.parseDateMatch(create);
            opt.create = { $gte: start, $lte: end };
        }
    }
    if (state == 1) {
        opt.state = 'success';
    }
    if (state == 2) {
        opt.state = 'pending';
    }
    if (packageid) {
        opt['data.packageid'] = packageid
    }

    if (uid) {
        opt.uid = uid;
    }
    const sort = {};
    if (_sort_ && _sort_.field) {
        sort[_sort_.field] = _sort_.order;
    } else {
        sort.create = -1;
    }
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

    const cursor = await orderModel.aggregate(agg, { allowDiskUse: true });
    let items = await cursor.toArray();

    items = items.map(({ create, state, tranid, data, }) => {
        // pid = pid_start(pid);
        // coupon = coupon ? "是" : "否";
        state = state == "success" ? "成功执行" : "异常订单";
        items = JSON.stringify(data.items)
        let packageid = data.packageid
        let uid = data.uid
        let serverid = data.serverid
        let price = data.price
        // confirm, deliver, coupon, cwh, pid, ...others
        return { create, state, tranid, items, packageid, uid, serverid, price }
    })

    let total = await orderModel.countDocuments(opt);

    return {
        items: items,
        total: total
    }
};

