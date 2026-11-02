
'use strict'
const assert = require('assert');

module.exports = exports = async function (needData) {
    let _data  = needData;
    let {
        index = 0,
        videolist,
        version,
        teamid,
        servid,
    } = _data
    // 计算胜利次数判断胜负
    let win = 0;
    for (let video of videolist) {
        if (video.result === 'win') win++;
    }
    win = win >= 2 ? 1 : 0;
    let target = this.targets[Number.parseInt(index)];
    let is_robotteam = target.startsWith('robotteam');
    if (!is_robotteam) {	// 玩家队伍
        target = await global.dao.pvpteam.findOne({ _id: target });
        assert(target, 'invalid team');
    } else {	// 机器人队伍
        // 默认1000分
        target = { score: 1000 };
    }
    let base_self = 20 + Math.max(Math.round((this.score - 1000) / 50), 0) * 2;
    let base_tar = 20 + Math.max(Math.round((target.score - 1000) / 50), 0) * 2;
    if (win) {
        base_self = 20;
        base_tar = -base_tar;
    } else {
        base_tar = 20;
        base_self = -base_self;
    }
    const minus = Math.round((this.score - target.score) / 20);
    base_self -= minus;
    base_tar += minus;
    if (win) {
        base_self = Math.max(base_self, 0);
        base_tar = Math.min(base_tar, 0);
    } else {
        base_self = Math.min(base_self, 0);
        base_tar = Math.max(base_tar, 0);
    }
    this.score += base_self;
    target.score += base_tar;
    // 我方记录分数时间更新
    this.last = Date.now();
    await this.save();
    // 组队演武的得分存入redis-我方
    let mygroupid = await global.dao.kinggroup.findOne({servid: this.servid});
    let rankService = new global.services.RankService('pvpteam',mygroupid.groupmark);
    await rankService.set({
        id: this._id.toString(),
        score: this.score
    });
    let return_data = {
        score: this.score,
        change: base_self,
    };
    if (win) return_data.win = 1;
    if (is_robotteam) return return_data;	// 机器人队伍没有保存分数/发送录像等逻辑
    // 他方记录分数时间更新
    target.last = Date.now();
    await target.save();
    // 组队演武的得分存入redis-敌方
    let target_groupid = await global.dao.kinggroup.findOne({servid: target.servid});
    let t_rankService = new global.services.RankService('pvpteam',target_groupid.groupmark);
    await t_rankService.set({
        id: target._id.toString(),
        score: target.score
    });
    let mark = [
        win ? 'lose' : 'win',
        target.score,
        base_tar,
        servid, // 进攻方的serverid
        teamid,	// 进攻方的队伍teamid
    ]

    global.dao.video.create({
		type: 'teampvp',
		rid: target.i(),
		video: JSON.stringify(videolist),
		mark: mark.join('.'),
		version,
	}).catch(console.error);
    return return_data;
}