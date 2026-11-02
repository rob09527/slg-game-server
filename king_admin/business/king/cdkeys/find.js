exports.name = '礼包码查询';
exports.type = 'I';
exports.inherit = 'cdkeys-view';
const moment = require("moment")
exports.exec = async function (body, query, ctx) {

    const {_page_, _sort_, channel, create, kname: name, key, servid} = body;
    const {limit, current} = _page_;
    const offset = (current - 1) * limit;
    let opt = {$and: []};
    if (channel) {
        opt.$and.push({
            $or: [{channel}, {channels: {$in: [channel]}}]
        })
    }
    if (servid && servid !== 'ALL') {
        const ser = Number.parseInt(servid)
        opt.$and.push({
            $or: [{servid: ser}, {servids: {$in: [ser]}}]
        })
    } else {
        const servers = await this.service.game.serversOptions(ctx.adminRole);
        const slist = servers.map(s => s.value);
        if (!servers.__is_all__)  // 被隔离了
            opt.$and.push({
                $or: [{servid: {$in: slist}}, {servids: {$in: slist}}]
            })
    }
    if (name) {
        opt.$and.push({
            name: new RegExp(name)
        })
    }
    if (key) {
        opt.key = key;
        opt.$and.push({key})
    }

    if (create && create[1]) {
        const [start, end] = this.parseDateMatch(create);
        opt.$and.push({
            create: {$gte: start, $lte: end}
        });
    }

    if (opt.$and.length === 0) opt = {};
    const sort = {};
    if (_sort_ && _sort_.field) {
        sort[_sort_.field] = _sort_.order;
    } else {
        sort._id = -1;
    }

    const cdkeyModel = await this.service.game.collection('cdkeys');
    const cursor = await cdkeyModel.find(opt).sort(sort).skip(offset).limit(+limit);
    const total = await cdkeyModel.countDocuments(opt);
    const items = await cursor.toArray();

    items.forEach(item => {
        item.status = !item.pause;
        item.rewardStr = item.items.map(o => `${o.GSID}*${o.COUNT}`).join(',');
        item.channel = (item.channels || (item.channel ? [item.channel] : []));
        item.channel_str = item.channel.join(',');
        item.servids = (item.servids || (item.servid ? [item.servid] : []));
        item.servid_str = item.servids.join(',');
        item.bundles = item.bundles ? item.bundles  : []
        item.bundles_str =  item.bundles.join(',');
        item.start = moment(item.start).format('YYYY-MM-DD HH:mm:ss');
        item.end = moment(item.end).format('YYYY-MM-DD HH:mm:ss');
    });

    return {
        items: items,
        total: total
    }
};

