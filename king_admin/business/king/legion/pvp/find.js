const {ObjectId} = require("mongodb");
exports.name = '军团对阵查询';
exports.type = 'I';
exports.inherit = 'legion-pvp-view';
exports.exec = async function (body, query, ctx) {

    const {_page_, _sort_, pvpDate, legionname, servid} = body;
    const {limit, current} = _page_;
    const offset = (current - 1) * limit;

    const lpvp = await this.service.game.collection('legionpvps');
    const legionModel = await this.service.game.collection('legions');


    const opt = {};
    if (pvpDate) {
        opt.pvpDate = pvpDate;
    }
    if (legionname) {
        const c = await legionModel.find({name: new RegExp(legionname)});
        const legions = await c.toArray();
        opt.legion = {
            $in: legions.map(l => l._id + '')
        }
    }

    const sort = {
        _id: -1
    };
    const cursor = await lpvp.find(opt).sort(sort).skip(offset).limit(+limit);
    const items = await cursor.toArray();

    const total = await lpvp.countDocuments(opt);
    const legionIds = [];
    items.forEach(one => {
        legionIds.push(ObjectId(one.legion[0]));
        if (one.legion[1]) {
            legionIds.push(ObjectId(one.legion[1]));
        }
    });
    const cur = await legionModel.find({_id: {$in: legionIds}}).limit(legionIds.length);
    const legions = await cur.toArray();
    const legionMap = {};
    legions.forEach(l => legionMap[l._id] = l);

    const getLegionInfo = (lid) => {
        if (!legionMap[lid]) {
            return "";
        }
        const l = legionMap[lid];
        return `${l.name}<span style="color: cornflowerblue; font-size: 12px">(${l.servid}服,积分:${l.pvpscore},军团战力:${l.power})</span>`;
    }
    items.forEach(item => {
        item.legionA = getLegionInfo(item.legion[0]);
        item.legionB = getLegionInfo(item.legion[1]);
        item.reportDetail = []; // 构建详情数据表
        if (item.report) {
            let winner;
            let loser;
            if (item.report.winner) {
                winner = legionMap[item.report._legion_[item.report.winner]];
                for (let k in item.report._legion_) {
                    if (k !== item.report.winner) {
                        loser = legionMap[item.report._legion_[k]]
                        break;
                    }
                }
                item.reportStr = '【' + (winner ? winner.name : '军团已解散') + '】 胜';
            } else {
                item.reportStr = '平局'
            }
            item.reportDetail.push({
                    title: '胜方',
                    value: winner && winner.name
                }, {
                    title: '败方',
                    value: loser && loser.name
                }, {
                    title: '比分',
                    value: `${item.report.score.left} : ${item.report.score.right}`
                },
                {
                    title: 'A方获得积分',
                    value: `${item.report.pvpscore.left || 0}`
                },
                {
                    title: 'B方获得积分',
                    value: `${item.report.pvpscore.right || 0}`
                })
        } else {
            item.reportStr = '未结束';
            item.reportStatus = 0;
        }
    })

    return {
        items,
        total
    }
};

