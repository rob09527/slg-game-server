exports.name = '服务器查询';
exports.type = 'I';
exports.inherit = 'servers-view';
exports.exec = async function (body, query, ctx) {

    const {_page_, _sort_, _export_, gameid} = body;
    const {limit, current} = _page_;

    const roles = await this.service.game.collection('roles');
    const tmp1 = await roles.aggregate([{$group:{_id:"$servid",count:{$sum:1}}}]);
    const data1 = await tmp1.toArray();
    let nums = {};
    data1.forEach(info => {
        nums[info._id] = info.count;
    })

    const orders = await this.service.game.collection('orders');
    const tmp2 = await orders.aggregate([
        {$match: {confirm: {$exists: true}}},
        {$project: {rid: 1, servid: 1}},
        {$group:{_id:{rid: "$rid",servid: "$servid"}}},
        {$group:{_id:"$_id.servid",count:{$sum:1}}}
    ]);
    const data2 = await tmp2.toArray();
    let pays = {}
    data2.forEach(info => {
        pays[info._id] = info.count;
    })

    let opt = {};

    const sort = {};
    if (_sort_ && _sort_.field) {
        sort[_sort_.field] = _sort_.order;
    } else {
        sort._id = -1;
    }

    const auto_num = +query.auto_num | 0;
    const auto_pay = +query.auto_pay | 0; 
    const auto_create = +query.auto_create | 0;

    const gameModel = await this.service.game.collection('gameservers');
    // const offset = (current - 1) * limit;

    const admin_role = ctx.adminRole;
    const authInfo = __group__auth__cache__[admin_role] === undefined ? await this.db.mongo.adminGroupAuth.findOne({group: admin_role}) : __group__auth__cache__[admin_role];

    if (authInfo) {
        opt.servid = {$gte: authInfo.serv.min, $lte: authInfo.serv.max};
    }
    if (gameid && gameid !== 'ALL') {
        opt['info.filter'] = gameid;
    }

    const cursor = await gameModel.find(opt).sort(sort)

    const items = await cursor.toArray();
    global._servers_cache_ = items.length;

    items.forEach(item => {
        item.area = item.area || {};
        item.area_id = item.area.id;
        item.filter = (item.info ? item.info.filter : []) || [];
        item.filter_str = item.filter.join(',');
        item.area_name = item.area.name;
        item.start = new Date(item.start).format();
        item.stype = item.type ? 2 : 1;
        item.type_str = item.type ? "审核" : "正常";
        item.role_num = nums[item.servid] || 0;
        item.pay_num = pays[item.servid] || 0;
        item.auto_num = item.auto_num || auto_num;
        item.auto_pay = item.auto_pay || auto_pay;
        item.auto_create = item.auto_create || auto_create;
        item.auto_create_str = item.auto_create == 1?"能":"否";
    });
    const total = await items.length
    return {
        items: items,
        total: total
    }
};

