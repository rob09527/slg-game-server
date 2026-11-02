exports.name = '订单数据查询';
exports.type = 'I';
exports.inherit = 'order-view';
const moment = require('moment');

const pid_config = {
    specialbw: "特权礼包",
    specialexp: "登录经验赏令",
    specialadv: "登录进阶赏令",
    specialmoney: "登录铜币赏令",
    specialgz: "普通月卡",
    specialzz: "超级月卡",
    specialzk: "周卡",
    specialyd: "月度特权",
    specialcz: "成长基金",
    specialcz1: "成长基金",
    specialcz2: "成长基金",
    specialfd: "封地特权",
    specialqz: "勤政爱民特权",
    specialtower: "试炼基金",
}

function pid_start(pid) {
    if (pid_config[pid]) {
        return pid_config[pid];
    }

    if (pid.startsWith("sjth")) {
        return "神将特惠"
    }
    else if (pid.startsWith("charge")) {
        return "元宝充值"
    }
    else if (pid.startsWith("spp")) {
        if (pid.startsWith("sppackday")) {
            return "日礼包"
        }
        const [_, cycle, index] = pid.split("_");
        if (cycle == "dayly") {
            return "每日特惠"
        }
        else if (cycle == "monthly") {
            return "每月特惠"
        }
        else if (cycle == "weekly") {
            return "每周特惠"
        }
    }
    else if (pid.startsWith("allspecial")) {
        return "登录赏令一键购买"
    }
    else if (pid.startsWith("worthfund")) {
        return "超值基金"
    }
    else if (pid.startsWith("zztjj")) {
        return "周主题基金"
    }
    else if (pid.startsWith("xsqg")) {
        return "限时抢购"
    }
    else if (pid.startsWith("xs_czlb")) {
        return "限时充值礼包"
    }
    else if (pid.startsWith("generalstar")) {
        return "武将升星礼包"
    }
    else if (pid.startsWith("gxlb")) {
        return "观星"
    }
    else if (pid.startsWith("actsppack")) {
        let [_, type, pack] = pid.split("_");
        if (type == "KFLB") {
            return "开服超值礼包"
        }
    }
    else if (pid.startsWith("recompgift")) {
        let [_, type] = pid.split("_");
        if(type.startsWith("BATCH")) {
            return "推送礼包:十连招募-"+type;
        }else if(type.startsWith("LV")) {
            return "推送礼包:等级-"+type;
        }else if(type.startsWith("ONLY")) {
            return "推送礼包:绝版-"+type;
        }else if(type.startsWith("BREAK")) {
            return "推送礼包:突破-"+type;
        }else if(type.startsWith("LIMIT")) {
            return "推送礼包:限时-"+type;
        }else if(type.startsWith("GUANYU")) {
            return "推送礼包:关羽-"+type;
        }else if(type.startsWith("ZHAOYUN")) {
            return "推送礼包:赵云-"+type;
        }
        else {
            return "推送礼包:"+type;
        }
    }
    
    return pid;
}

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
        ...othersOpt
    } = body;
    const {limit, current} = _page_;
    console.error(JSON.stringify(body))
    const offset = (current - 1) * limit;
    let opt = {};
    if (servid && servid !== 'ALL') {
        opt.servid = Number.parseInt(servid);
    } else {
        const servers = await this.service.game.serversOptions(ctx.adminRole);
        if (!servers.__is_all__)  // 被隔离了
            opt['servid'] = {
                $in: servers.map(s => s.value)
            }
    }

    if (pid) {
        opt.pid = new RegExp(pid, 'g');
    }

    if (bundle && bundle.length) {
        opt.bundle = {$in: this.db.mongo.bundle.parseBundlesMatch(bundle)};
    }
    if (type && type !== 'ALL') {
        opt.coupon = {[+type === 2 ? '$eq' : "$ne"]: true};
    }

    const orderModel = await this.service.game.collection('orders');

    if (oid) { // 查询订单号时，查询第三方订单号和 本地订单号
        opt = {$or: [{oid}, {transactionid: oid}]};
    } else {
        for (let k in othersOpt) {
            if (othersOpt[k] && othersOpt[k] !== 'ALL') {
                opt[k] = othersOpt[k];
            }
        }
        if (ignore) {
            opt.confirm = {$exists: true};
        }

        if (create && create[1]) {
            const [start, end] = this.parseDateMatch(create);
            opt.create = {$gte: start, $lte: end};
            if (today) { // 当日为玩家首充
                const ignoreCursor = await orderModel.aggregate([
                    {
                        $match: {price: {$gt: 0}, confirm: {$exists: true}, ...opt, create: {$lt: opt.create.$gte}}
                    },
                    {
                        $project: {
                            uid: 1, rid: 1, servid: 1
                        }
                    },
                    {
                        $group: {
                            _id: {
                                rid: "$rid",
                                servid: "$servid"
                            }
                        }
                    }]);
                const ignore = await ignoreCursor.toArray();
                // 排除之前充值过的玩家
                opt.rid = {$nin: ignore.map(o => o._id.rid)};
            }
        }
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
    // 设置首充日时，只查询第一笔订单
    if (today) {
        const $group = {};
        $group._id = {
            rid: "$rid",
            servid: "$servid"
        }
        $group.uid = {
            $first: '$uid',
        }
        $group.servid = {
            $first: '$servid',
        }
        $group.rid = {
            $first: '$rid',
        }
        $group.channel = {
            $first: '$channel',
        }
        $group.platform = {
            $first: '$platform',
        }
        $group.bundle = {
            $first: '$bundle',
        }
        $group.oid = {
            $first: '$oid',
        }
        $group.price = {
            $first: '$price',
        }
        $group.pid = {
            $first: '$pid',
        }
        $group.create = {
            $first: '$create',
        }
        $group.confirm = {
            $first: '$confirm',
        }
        $group.deliver = {
            $first: '$deliver',
        }
        $group.current_level = {
            $first: '$current_level',
        }

        $group.coupon = {
            $first: '$coupon',
        }
        $group.transactionid = {
            $first: '$transactionid'
        }
        agg.splice(1, 0, {$sort: {_id: 1}}, {$group});
    }
    const cursor = await orderModel.aggregate(agg, {allowDiskUse: true});
    let items = await cursor.toArray();

    items = items.map(({create, confirm, deliver, coupon, cwh, pid, ...others}) => {
        pid = pid_start(pid);
        coupon = coupon ? "是" : "否";
        cwh = cwh ? "是" : "否";
        return {create, confirm, deliver, coupon, cwh, pid, ...others}
    })
    let total = 0;
    if (today) { // 只统计第一笔总数
        const totalCur = await orderModel.aggregate([{$match: opt}, {
            $group: {
                _id: {
                    rid: "$rid",
                    servid: "$servid"
                }
            }
        }, {$group: {_id: null, count: {$sum: 1}}}]);
        const o = await totalCur.toArray();
        total = o[0] ? o[0].count : 0;
    } else {
        total = await orderModel.countDocuments(opt);
    }
    return {
        items: items,
        total: total
    }
};

