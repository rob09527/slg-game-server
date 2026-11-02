const ObjectId = require('mongodb').ObjectId;
exports.name = '军团查询';
exports.type = 'I';
exports.inherit = 'legion-info-view';
exports.exec = async function (body, query, ctx) {

    const {_page_, _sort_, servid, lname} = body;
    const {limit, current} = _page_;


    const levelExp = [];
    for (let {EXP: exp} of this.service.game.config.legionlevel) {
        const lastExp = levelExp[levelExp.length - 1] || 0;
        levelExp.push(exp + lastExp);
    }
    const opt = {};
    if (servid && servid !== 'ALL') {
        opt.servid = +servid;
    } else {
        const servers = await this.service.game.serversOptions(ctx.adminRole);
        if (!servers.__is_all__)  // 被隔离了
            opt['servid'] = {
                $in: servers.map(s => s.value)
            }
    }


    if (lname) {
        opt.name = new RegExp(lname);
    }


    const legions = await this.service.game.collection('legions');

    const itemOpt = {
        _expdaily: 0
    };

    const sort = {};
    if (_sort_ && _sort_.field) {
        if (_sort_.field === 'level') {
            _sort_.field = 'exp'
        }
        sort[_sort_.field] = _sort_.order;
    } else {
        sort._id = -1;
    }
    const offset = (current - 1) * limit;

    const cursor = await legions.find(opt).project(itemOpt).sort(sort).skip(offset).limit(+limit);
    const roles = await this.service.game.collection('roles');

    const items = await cursor.toArray();
    const membersRid = [];
    items.forEach(item => {
        for (let k in levelExp) {
            item.level = +k;
            if (levelExp[k] > item._exp) {
                break;
            }
        }
        item.count = item._members.length;
        item._members.forEach(m => {
            membersRid.push(ObjectId(m.rid));
            if (m.pos === 2) {
                item.ceo = m.rid;
            }
        })
    });
    const total = await legions.countDocuments(opt);
    const roleCursor = await roles.find({_id: {$in: membersRid}}).project({
        rname: 1,
        _id: 1,
        rno: 1,
        notice: 1,
        legionjointime: 1
    });
    const memberInfo = await roleCursor.toArray();
    const memberMap = {};
    const memberJoinTime = {};
    memberInfo.forEach(r => {
        memberMap[r._id] = r.rname || `主公${r.rno}`;
        memberJoinTime[r._id] = r.legionjointime;
    });

    items.forEach(item => {

        item.rname = memberMap[item.ceo];
        item.jointime = memberJoinTime[item.ceo];
        item.children = [];
        item.members = [];

        item._members.forEach(m => {
            item.members.push({
                name: memberMap[m.rid] || m.rid,
                value: m.rid
            })
            item.children.push({
                rname: memberMap[m.rid],
                from: { // 为了统一 mute 和 ban 的结构
                    rid: m.rid
                },
                jointime: memberJoinTime[m.rid]
            });
        });
        if (item.children.length === 0) {
            item.children = undefined;
        }

    })
    return {
        items: items,
        total: total
    }
};

