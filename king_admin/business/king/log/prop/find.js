exports.name = '道具日志查询';
exports.type = 'I';
exports.inherit = 'log-prop-view';


const FORMAT = "YYYY-MM-DD";
const pathDesc = require('../../../../gconfig/pathDesc.json');
exports.exec = async function (body, query, ctx) {

    const {serverid, search, gsid, date, from} = body;
    let {limit, current} = body._page_;
    limit = Math.min(10000, limit);
    const offset = (current - 1) * limit;

    let uid = body.uid;


    const match = [];

    match.push({
        "term": {
            "type": 'item_count_modify'
        }
    });

    if (uid) {
        const arr = uid.split(',');
        match.push({
            "terms": {
                "uid": arr
            }
        });
    } else {
        if (search) {
            const roles = await this.service.game.collection('roles');
            const rnos = search.split(',');
            if (!isNaN(rnos[0]) && rnos[0].length === 7) {
                match.push({
                    "terms": {
                        "rno": rnos.map(Number)
                    }
                });
            } else {
                const opt = {rname: search}
                if (serverid && serverid !== 'ALL') {
                    opt.servid = +serverid;
                }
                const role = await roles.findOne(opt);
                if (!role) {
                    return { // 角色不存在直接返回空数据
                        items: [],
                        total: 0
                    }
                }
                match.push({
                    "term": {
                        "uid": role.uid
                    }
                });
            }
        }
    }

    if (serverid && serverid !== 'ALL') {
        match.push({
            "term": {
                "servid": +serverid
            }
        })
    }

    if (gsid) {
        match.push({
            "terms": {
                "gsid": gsid.split(',').map(g => +g)
            }
        });
    }

    if (body.type && body.type !== 'ALL') {
        match.push({
            "term": {
                act: body.type.toLowerCase()
            }
        });
    }

    if (from) {
        match.push({
            "regexp": {
                "frompath": from
            }
        });
    }


    const now = Date.now();
    let [start, end] = date || [now, now];

    start = new Date(start || now);
    start.setHours(0, 0, 0, 0);
    end = new Date(end || now);
    end.setHours(0, 0, 0, 0);
    let total;
    let items;
    const esIndex = [];
    for (let n = start; n.getTime() <= end.getTime(); n.setDate(n.getDate() + 1)) {
        esIndex.unshift('addcst-' + n.format(FORMAT));
    }
    if (esIndex.length > 15) {
        throw '最多只能查询连续的15天日志';
    }
    console.log('esIndex', esIndex, 'match', match);
    const res = await this.service.game.queryLog(esIndex, match, offset, limit, body);

    total = res.total;
    items = res.items;

    return {
        items: items,
        total: total
    }
};

