const ObjectId = require('mongodb').ObjectId;
exports.name = '角色数据查询';
exports.type = 'I';
exports.inherit = 'role-view';
exports.exec = async function (body, query, ctx) {

    const {
        _page_,
        _sort_,
        serverid: servid,
        search,
        create,
        activeDate,
        _export_,
        bundle,
        expand,
        platform,
        ...othersOpt
    } = body;
    const {limit, current} = _page_;
    // console.log('this serverid', servid, this);
    if (!servid) {
        throw '确实必要条件 serverid';
    }
    const levelExp = [];
    for (let exp of this.service.game.config.roleexp) {
        levelExp.push(exp + (levelExp.length ? levelExp[levelExp.length - 1] : 0));
    }
    const vipExp = this.service.game.config.vip.EXP;
    const maplist = Object.keys(this.service.game.config.chapter);
    const offset = (current - 1) * limit;
    const opt = {};
    if (servid !== 'ALL') {
        opt.servid = +servid;
    } else {
        const servers = await this.service.game.serversOptions(ctx.adminRole);
        if (!servers.__is_all__)  // 被隔离了
            opt['servid'] = {
                $in: servers.map(s => s.value)
            }
    }
    if (search && !isNaN(search) && search.length === 7) { // rno
        opt.rno = +search;
    } else if (search) {
        if (/^[a-f0-9]{24}$/.test(search)) { //"5ef1628a93331378c8a75541"
            opt._id = ObjectId(search);
            delete opt.servid;
        } else {
            opt.$or = [
                {rname: search},
                {uid: search}
            ];
        }
    }
    if (create && create[1]) {
        const [start, end] = this.parseDateMatch(create);
        opt.create = {$gte: start, $lte: end};
    }

    if (bundle && bundle.length) {
        opt.bundle =  {$in:  this.db.mongo.bundle.parseBundlesMatch(bundle)  }  ;
    } else {
        const bundles = await this.db.mongo.bundle.getBundles(ctx.adminRole, true);
        if (!bundles.__is_all__)  opt.bundle = {$in: bundles}
    }

    if (platform && platform.length) {
        opt.platform = Array.isArray(platform) ? {$in: platform} : platform;
    }
    if (activeDate && activeDate[0]) { // 存在活跃

        // 活跃 查询 按照 登录日志来

        const [start, end] = this.parseDateMatch(activeDate);
        const loginlogMatch = {date: {$gte: start, $lte: end}};
        const logModel = await this.service.game.collection('loginlogs');
        const cur = await logModel.aggregate([{$match: loginlogMatch}, {$group: {_id: "$rid"}}]);
        const loginLogs = await cur.toArray();
        if (loginLogs.length === 0) {
            return {
                items: [],
                total: 0
            }
        }

        opt._id = {$in: loginLogs.map(l => l._id)};
    }
    let expandGsid;
    let expendColumns;


    for (let k in othersOpt) {
        if (othersOpt[k] && othersOpt[k] !== 'ALL') {
            opt[k] = othersOpt[k];
        }
    }
    const sort = {};
    if (_sort_ && _sort_.field) {
        if (_sort_.field === 'level') {
            _sort_.field = 'hide.38001.count'
        } else if (_sort_.field === 'maxmapid') {
            _sort_.field = '_maxmapid';
        } else if (_sort_.field === 'vip') {
            _sort_.field = 'hide.38003.count'
        }
        sort[_sort_.field] = _sort_.order;
    } else {
        sort._id = -1;
    }


    const roles = await this.service.game.collection('roles');
    const itemOpt = {
        servid: 1,
        rno: 1,
        rname: 1,
        channel: 1,
        platform: 1,
        bundle: 1,
        'hide.38001': 1,
        'hide.38003': 1,
        uid: 1,
        create: 1,
        update: 1,
        legion: 1,
        _maxmapid: 1,
        phonetype: 1
    };
    if (expand) {
        expandGsid = expand.split(',');
        expendColumns = [];
        for (const gsid of expandGsid) {
            let key;
            if (gsid.startsWith('38')) {
                key = `hide.${gsid}.count`;
                itemOpt[key] = 1;
            } else if (gsid.startsWith('3')) {
                key = `props.${gsid}.count`;
                itemOpt[key] = 1;
            } else if (gsid.startsWith('9')) {
                key = `others.${gsid}.count`;
                itemOpt[key] = 1;
            }
            expendColumns.push({
                title: gsid,
                dataIndex: key,
                width: 80,
            })
        }

    }
    const cursor = await roles.find(opt).project(itemOpt).sort(sort).skip(offset).limit(+limit);
    const items = await cursor.toArray();
    items.forEach(item => {
        const exp = item.hide && item.hide[38001] ? item.hide[38001].count : 0;
        item._exp_ = exp;
        item.maxmapid = maplist[item._maxmapid];
        for (let k in levelExp) {
            item.level = +k;
            if (levelExp[k] > exp) {
                break;
            }
        }
        item.rname = item.rname || item.uid;
        const vip_exp = item.hide && item.hide[38003] ? item.hide[38003].count : 0;
        item._vipexp_ = vip_exp;
        item.vip = 0;
        for (let i in vipExp) {
            if (vip_exp < vipExp[i]) break;
            item.vip = +i;
        }

    });
    const total = await roles.countDocuments(opt);
    return {
        items: items,
        total: total,
        expendColumns
    }
};

