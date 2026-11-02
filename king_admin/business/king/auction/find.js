const ObjectId = require('mongodb').ObjectId;
exports.name = '拍卖查询';
exports.type = 'I';
exports.inherit = 'auction-view';
exports.exec = async function (body, query, ctx) {

    const {_page_, _sort_, servid, auctioneer_info, status, create} = body;
    const {limit, current} = _page_;
    const offset = (current - 1) * limit;
    let opt = {};
    if (status && status !== 'ALL') {
        opt.status = +status;
    }

    const auctionModel = await this.service.game.collection('auctions');
    const legionModel = await this.service.game.collection('legions');
    if (auctioneer_info === '北伐') {
        opt.auctioneer = 'north'
    } else if (auctioneer_info === '国战') {
        opt.auctioneer = 'nation'
    } else if (auctioneer_info) {
        const l = await legionModel.findOne({name: auctioneer_info});
        if (l) {
            opt.auctioneer = `legion_${l._id}`;
        } else {
            opt.auctioneer = null;
        }
    }
    if (create && create[0]) {
        const [start, end] = this.parseDateMatch(create);
        opt.create = {$gte: start, $lte: end};
    }
    const sort = {};
    if (_sort_ && _sort_.field) {
        sort[_sort_.field] = _sort_.order;
    } else {
        sort._id = -1;
    }
    if (servid && servid !== 'ALL') {
        const m = await this.service.game.collection('gameservers');
        const s = await m.findOne({servid: +servid});
        opt.groupid = s ? s.groupid : -1;
    } else {
        const servers = await this.service.game.serversOptions(ctx.adminRole);
        if (!servers.__is_all__)  // 被隔离了
            opt.groupid = {$in: servers.map(s => s.groupid)};
    }


    const cursor = await auctionModel.find(opt).sort(sort).skip(offset).limit(+limit);
    const total = await auctionModel.countDocuments(opt);
    const items = await cursor.toArray();
    const rids = [];
    const auctioneers = items.map(_ => {
        rids.push(..._.history.map(h => ObjectId(h.rid)));
        return _.auctioneer
    });
    const legionIds = auctioneers.filter(_ => _.startsWith('legion_')).map(_ => ObjectId(_.split('_')[1]));
    const auctioneerMap = {
        nation: '国战',
        north: "北伐"
    }
    const roleMap = {};
    if (rids.length > 0) {
        const roles = await this.service.game.collection('roles');
        const roleCursor = await roles.find({_id: {$in: rids}}).project({
            rname: 1,
            rno: 1,
            uid: 1,
            'hide.38003': 1,
            servid: 1
        });
        const roleList = await roleCursor.toArray();
        roleList.forEach(r => roleMap[r._id.toString()] = r);
    }


    if (legionIds.length > 0) {
        const lcursor = await legionModel.find({_id: {$in: legionIds}});
        const legions = await lcursor.toArray();
        legions.forEach(l => {
            auctioneerMap ['legion_' + l._id] = '军团战:' + l.name;
        });
    }
    let out = null;
    if (body._export_) {
        const vipExp = this.service.game.config.vip.EXP;
        out = [];
        items.forEach(item => {
            const r = {...item};
            r.auctioneer_info = auctioneerMap[item.auctioneer];
            r.item_str = `${item.item.gsid} * ${item.item.count}`;
            r.status_str = item.status === 0 ? '拍卖中' : item.status === 1 ? '已售出' : '流拍';
            r.gid = item._id;
            const last = item.history[item.history.length - 1];
            r.sellPrice = last ? last.price : 0;
            const one = [];
            if (last) {
                for (const h of item.history) {
                    const role = roleMap[h.rid] || {hide: {}};

                    const vip_exp = role.hide[38003] ? role.hide[38003].count : 0;

                    role.vip = 0;
                    for (let i in vipExp) {
                        if (vip_exp < vipExp[i]) break;
                        role.vip = +i;
                    }

                    one.unshift({
                        ...r,
                        servid: role.servid,
                        rname: role.rname,
                        uid: role.uid,
                        rno: role.rno,
                        vip: role.vip,
                        auctionPrice: h.price,
                        auc_create: h.create,

                    })
                }
                out.push(...one);
            } else {
                r.auctionPrice = undefined;
                r.servid = servid;
                out.push(r);
            }
        })

    } else {
        items.forEach(item => {
            item.auctioneer_info = auctioneerMap[item.auctioneer];
            item.item_str = `${item.item.gsid} * ${item.item.count}`;
            item.status_str = item.status === 0 ? '拍卖中' : item.status === 1 ? '已售出' : '流拍';
            item.servid = servid;
            item.children = [];
            for (const h of item.history) {
                item.children.unshift({
                    _id: `${item._id}_${h.price}`,
                    auctioneer_info: roleMap[h.rid] && roleMap[h.rid].rname,
                    rid: h.rid,
                    auctionPrice: h.price,
                    isonce: h.isonce,
                    create: h.create,
                });
                item.auctionPrice = h.price;
            }
            if (item.children.length === 0) {
                item.children = null;
            }
        });
    }

    return {
        items: out || items,
        total: total
    }

};

