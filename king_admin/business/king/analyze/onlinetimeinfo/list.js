const moment = require("moment");
const {ObjectId} = require("mongodb");
exports.name = '在线时长查询';
exports.type = 'I';
exports.inherit = 'analyze-ltvmenus';


exports.exec = async function (body, query, ctx) {
    const {
        servid,
        date,
        _page_ = {},
        _sort_,
    } = body;

    const {  current = 1} = _page_;
    const limit = Math.min(10000, _page_.limit);
    const offset = _page_.offset || (current - 1) * limit;

    const match = [
        {"term": {"type": "event_login"}}
    ];


    if (date && date[1]) {
        const [start, end] = this.parseDateMatch(date);
        match.push({"range": {"create": {"gt": new Date(start), 'lte': new Date(end)}}});
    }

    if (servid && servid !== 'ALL') {
        match.push({"term": {"servid": servid}});
    } else {

        const servers = await this.service.game.serversOptions(ctx.adminRole);
        if (!servers.__is_all__) { // 被隔离了的就不查询全服邮件
            return {
                items: [],
                total: 0
            }
        }
    }

    // 聚合查询 时间段内的事件操作数量
    const res = await this.service.game.elastic.search({
        index: global.config.game.es.DEF_INDEX || 'king',
        type: 'event',
        body: {
            "query": {
                "constant_score": {
                    "filter": {
                        "bool": {
                            "must": match
                        }
                    }
                }
            },
            "sort": {"create": "desc"},
            "size": +limit,
            "from": offset
        }
    });

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
        update: 1
    };

    const total = res.hits.total;
    const items = res.hits.hits.map(o => o._source);
    const ids = items.map(r => ObjectId(r.rid));
    const cursor = await roles.find({_id: {$in: ids}}).project(itemOpt);
    const roleList = await cursor.toArray();
    const tmp = {};


    const vipExp = this.service.game.config.vip.EXP;
    const levelExp = [];
    for (let exp of this.service.game.config.roleexp) {
        levelExp.push(exp + (levelExp.length ? levelExp[levelExp.length - 1] : 0));
    }

    roleList.map(item => {
        const exp = item.hide && item.hide[38001] ? item.hide[38001].count : 0;
        item._exp_ = exp;
        for (let k in levelExp) {
            item.level = +k;
            if (levelExp[k] > exp) {
                break;
            }
        }
        const vip_exp = item.hide && item.hide[38003] ? item.hide[38003].count : 0;
        item._vipexp_ = vip_exp;
        item.vip = 0;
        for (let i in vipExp) {
            if (vip_exp < vipExp[i]) break;
            item.vip = +i;
        }
        tmp[item._id] = item;
    });


    for (const item of items) {
        const role = tmp[item.rid] || {};
        item.rname = role.rname;
        item.vip = role.vip;
        item.level = role.level;
        item.uid = item.info && item.info.uid;
        const info = item.info||{ online_ms: 0};
        item.online_ms = Math.floor(info.online_ms / 1000/ 60) + 'm';
    }


    return {
        items: items,
        total: total.value
    }
}
