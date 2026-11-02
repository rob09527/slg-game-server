
'use strict'

const assert = require('assert');
// 获取对手
module.exports = exports = async function (force = 0) {
    const TARGETS = [
        {score: {$gte: 0.9}},
        {score: {$gte: 0.8, $lte: 1.2}},
        {power: {$gte: 0.5, $lte: 0.9}},
    ];
    let mygroup = await global.dao.kinggroup.findOne({servid: this.servid});
    const _list = await global.dao.kinggroup.find({groupmark: mygroup.groupmark});
    let $in =  _list.map(({servid}) => servid);
    assert(_list && $in.length > 0, 'invalid sid list');

    if (this.targets.length < 3 || force) {	// 搜索目标
        // 获取同组服务器编号
        let _targets = [];
        for (let i = 0; i < TARGETS.length; i++) {
            let target = TARGETS[i];
            let team = [];
            if (team.length < 1) {	// 范围内玩家队伍
                let cond = {
                    servid: {
                        $in,
                    },
                    _id: {
                        $nin: [this._id],
                    },
                    fellows:{$size:3}
                }
                // 排除已经选出来的队伍
                cond._id.$nin.append(_targets.filter(target => !target.startsWith('robotteam')));
                for (let [key, val] of Object.entries(target)) {
                    cond[key] = {};
                    for (let [_key, _val] of Object.entries(val)) {
                        cond[key][_key] = Math.trunc(_val * this[key]);
                    }
                }
                team = await global.dao.pvpteam.find(cond, { _id: 1 });
            }
            if (team.length < 1) {	// 范围外玩家队伍
                let cond = {
                    servid: {
                        $in,
                    },
                    _id: {
                        $nin: [this._id],
                    },
                    fellows:{$size:3}
                }
                // 排除已经选出来的队伍
                cond._id.$nin.append(_targets.filter(target => !target.startsWith('robotteam')));
                for (let [key, val] of Object.entries(target)) {
                    cond.$or = [];
                    for (let [_key, _val] of Object.entries(val)) {
                        // 反义词
                        if (_key === '$gte') _key = '$lt';
                        if (_key === '$lte') _key = '$gt';
                        cond.$or.push({
                            [key]: {
                                [_key]: Math.trunc(_val * this[key]),
                            }
                        })
                    }
                }
                team = await global.dao.pvpteam.find(cond, { _id: 1 });
            }
            if (team.length < 1) {	// 机器人队伍
                let index = Math.rand.between(0, global.gameconfig.robotteam.length - 1);
                team = [{ _id: `robotteam_${index}` }];
            }
            assert(team.length > 0, 'config err');
            team = team[Math.rand.between(0, team.length - 1)];
            _targets.push(team._id.toString());
        }
        this.targets = _targets;
        await this.save();
    }
    let list = [];
    for (let _id of this.targets) {
        if (_id.startsWith('robotteam')) {
            list.push({ teamid: _id });
        } else {
            let team = await global.dao.pvpteam.findOne({ _id });
            if (team) {
                list.push({
                    teamid: team._id.toString(),
                    servid: team.servid,
                    score: team.score,
                })
            }
        }
    }
    return { list };
}