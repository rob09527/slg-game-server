exports.name = '聊天查询';
exports.type = 'I';
exports.inherit = 'chat-view'; // 权限继承于同功能组的 notice
const moment = require('moment');
const FORMAT = "YYYY_MM";
exports.exec = async function (body, query, ctx) {
    const setting = await this.remote.proxy_get_global();

    const {_page_, room, time, search} = body;

    const {limit, current} = _page_;
    const offset = (current - 1) * limit;
    const match = [];
    const match_not = [];
    if (search) {
        const roles = await this.service.game.collection('roles');
        const opt = {};
        if (!isNaN(search) && search.length === 7) {
            opt.rno = +search
        } else {
            opt.rname = search;
        }
        const role = await roles.findOne(opt, {_id: 1});
        if (!role) {
            return {
                items: [],
                total: 0
            }
        }
        match.push({
            term: {
                'from.rid': role._id + '',
            }
        });
    }

    const rooms = [];
    if (room && room !== 'ALL') {
        const [, m] = room.split(':');
        if (m.startsWith('legion_')) {

            const legionModel = await this.service.game.collection('legions');
            const r = await legionModel.find({servid: +m.replace('legion_', '')}, {_id: 1});
            const arr = await r.toArray();
            console.log('arr', arr);
            if (!arr.length) {
                return {
                    items: [],
                    total: 0
                }
            }
            rooms.push(...arr.map(a => `legion_${a._id}`));
        } else {
            rooms.push(m);
        }
        match.push({
            "terms": {
                room: rooms
            }
        })
    }
    else{
        const servers = await this.service.game.serversOptions(ctx.adminRole);
        if (!servers.__is_all__) { // 被隔离了
            const rooms = servers.map(s => `serv_${s.groupid}`);
            rooms.push(...servers.map(s => `cross_${s.room}`));
            rooms.push(...servers.map(s => `legion_${s.value}`));
            match.push({
                "terms": {
                    room: rooms
                }
            })
        }
    }

    if (time && time[0]) {
        const [start, end] = this.parseDateMatch(time);
        match.push({
            "range": {
                "time": {"gte": new Date(start), "lte": new Date(end)}
            }
        });
    }
    // match_not.push({
    //     "wildcard": {
    //         "message.keyword":"*</c>副本挑战*"
    //     }
    // });
    const filter = setting.chat_filter.split(',');
    filter.forEach(w => {
        if(w != '') {
            match_not.push({
                "wildcard": {
                    "message.keyword":"*"+w+"*"
                }
            })
        }
    });

    const _date_key = '_' + moment().format(FORMAT);

    const _q_ = {
        index: (global.config.game.chat_index || 'chat') + _date_key,
        ignoreUnavailable: true,
        type: 'doc',
        body: {
            "query": {
                "constant_score": {
                    "filter": {
                        "bool": {
                            "must": match,
                            "must_not": match_not
                        }
                    }
                },
            },
            "sort": {"time": "desc"},
            "size": +limit,
            "from": offset
        }
    };

    // 聚合查询 时间段内的事件操作数量
    const res = await this.service.game.elastic.search(_q_).catch(e => {
        console.error('FIND CHAT', e);
        throw '聊天记录查询异常，稍后再试!'
    });

    const total = res.hits.total.value;
    const items = res.hits.hits.map(o => {
        const room_info = o._source.room;
        o._source._id = o._id;
        if (room_info.startsWith('serv_')) {
            o._source.room = '单服:' + room_info.replace('serv_', '');
        } else if (room_info.startsWith('cross_')) {
            o._source.room = '跨服:' + room_info.replace('cross_', '');
        } else if (room_info.startsWith('legion_')) {
            o._source.room = '军团:' + room_info.replace('legion_', '');
        } else {
            o._source.room = room_info;
        }
        return o._source;
    });
    return {
        items,
        total
    }
};

