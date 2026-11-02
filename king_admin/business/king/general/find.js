exports.name = '角色武将列表';
exports.type = 'I';
exports.inherit = 'general-view';
// const moment = require('moment');
exports.exec = async function (body, query, ctx) {
    const {_page_, _sort_, rno , gsid} = body;
    let err = true;
    if (rno && !isNaN(rno) && rno.length === 7) { // rno
        err = false
    }
    if(err){
        return {
            items: [],
            total: 0
        }
    }
    let _gsid = 0;
    if (gsid && !isNaN(gsid)) { // gsid
        _gsid = +gsid;
    }
    const {limit, current} = _page_;
    const offset = (current - 1) * limit;
    let opt = {
        rno: +rno
    }
    const sort = {};

    if (_sort_ && _sort_.field) {
        sort[_sort_.field] = _sort_.order;
    } else {
        sort._id = -1;
    }
    const roles = await this.service.game.collection('roles');
    let itemOpt = {rno:1,rname:1,uid:1};
    const cursor1 = await roles.find(opt).project(itemOpt).sort(sort).skip(offset).limit(+limit);
    const items1 = await cursor1.toArray();
    const role = items1[0];
    if(!role){
        return {
            items: [],
            total: 0
        }
    }
    opt = {
        rid: role._id.toString()
    }
    if(_gsid > 0){
        opt.gsid = _gsid;
    }
    itemOpt = {rid:1,gsid:1,level:1,class:1,create:1};
    const generals = await this.service.game.collection('generals');
    const cursor = await generals.find(opt).project(itemOpt).sort(sort).skip(offset).limit(+limit);
    const items = await cursor.toArray();
    const total = await generals.countDocuments(opt);
    items.forEach(item => {
        item.rno = +rno;
        item.uid = role.uid;
        item.rname = role.rname || role.uid;
    })

    return {
        items: items,
        total
    }
};

