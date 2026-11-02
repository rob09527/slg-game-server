exports.name = '战斗数据查询';
exports.type = 'I';
exports.inherit = 'battle-view';
const ObjectId = require('mongodb').ObjectId;

exports.exec = async function (body, query, ctx) {

    const {_page_, _sort_, _id, rname, type} = body;
    const {limit, current} = _page_;
    const offset = (current - 1) * limit;
    let opt = {};
    if (_id) {
        opt._id = ObjectId(_id);
    }
    const roles = await this.service.game.collection('roles');
    if (rname) {

        const role = await roles.findOne({
            $or: [{
                rname: rname
            }, {
                uid: rname
            }, {
                rno: parseInt(rname)
            }]
        })
        if (!role) {
            return {
                items: [],
                total: 0
            }
        }
        opt.rid = role._id.toString()
    }


    const sort = {};
    if (_sort_ && _sort_.field) {
        sort[_sort_.field] = _sort_.order;
    } else {
        sort._id = -1;
    }

    let total;
    let items;
    if (type === 'NORMAL') {
        const videoModel = await this.service.game.collection('c_battles');

        const cursor = await videoModel.find(opt).sort(sort).skip(offset).limit(+limit);
        total = await videoModel.countDocuments(opt);
        items = await cursor.toArray();
    } else {
        const videoModel = await this.service.game.collection('videos');

        const cursor = await videoModel.find(opt).sort(sort).skip(offset).limit(+limit);
        total = await videoModel.countDocuments(opt);
        items = await cursor.toArray();
    }

    const roleMap = {};


    const c = await roles.find({_id: {$in: items.map(o => ObjectId(o.rid))}}).project({
        _id: 1,
        uid: 1,
        rname: 1,
        servid: 1
    });
    const roleList = await c.toArray();
    roleList.forEach(r => {
        roleMap[r._id.toString()] = r;
    })

    items.forEach(item => {
        const r = roleMap[item.rid] || {};
        item.rname = r.rname || r.uid;
        item.servid = r.servid;
        item.create = item.finish || item.time;
        item.ret = item.result ? item.result.ret : item.video && item.video.indexOf('"result":"win"') > 0 ? 'win' : 'lose';
    });

    return {
        items: items,
        total: total
    }
};

