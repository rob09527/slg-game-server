'use strict';

const select_role = {
    _id: 1,
    rno: 1, rname: 1, iconid: 1, headid: 1, frameid: 1, sex: 1,
    '_powerbattleset.pvpdef': 1,
    'battlearr.pvpdef': 1,
    'battlearr.normal': 1,
    legion: 1,
    servid: 1,
    'hide.38001': 1,
    'hide.38003': 1,
    tech: 1,
    mythical: 1,
    destiny: 1
}
const RANK_KEY = 'pvpdef_power';
const matchOne = async (powers, ignore, sex, groupId) => {

    const ignoreTmp = {};
    if (ignore && ignore.length) {
        ignore.forEach(id => ignoreTmp[id] = true);
    }
    const rankService = new global.services.RankService(RANK_KEY, groupId);
    const arr = await rankService.itemsByScore(powers[0], powers[1], 0, Math.floor(100 + Math.random() * 100));

    let getRoleId;
    if (arr.length > 0) { //
        const filterArr = arr.filter(a => !ignoreTmp[a]);
        getRoleId = filterArr[Math.floor(Math.random() * filterArr.length)] || filterArr[0];
    } else {
        const filterArr = await rankService.itemsByScore(Math.floor(powers[0] / 5), Math.floor(powers[1] * 1), 0, Math.floor(100 + Math.random() * 100));
        getRoleId = filterArr[Math.floor(Math.random() * filterArr.length)] || filterArr[0];
    }

    let tmp;
    if (!getRoleId) {
        let robotlist = global.gameconfig.robotmazepvp.filter((robot) => {	// filter in range
            return robot.POWER >= powers[0] && robot.POWER <= powers[1];
        });
        let arobotlist = global.gameconfig.robotmazepvp.filter((robot) => {	// filter in range
            return robot.POWER < powers[0];
        });
        const randomIndex = Math.floor(Math.random() * robotlist.length);
        const allRandomIndex = Math.floor(Math.random() * arobotlist.length); // 补位时用逻辑
        const rb = robotlist[randomIndex] || arobotlist[allRandomIndex] || global.gameconfig.robotmazepvp[0];
        const robot = global.dao.role.robotGenerator(rb); // 转化阵容
        robot.sex = sex || 1;
        robot.isbot = 1;
        tmp = robot;
    } else {
        const target = await global.dao.role.findOne({ _id: getRoleId }, select_role);
        assert(target, 'invalid target:'+getRoleId);
        tmp = {
            rid: target.i(),
            rname : target.name,
            iconid : target.iconid,
            frameid : target.frameid
        };

        tmp.battleset = await target.getBattleSet('pvpdef');
        const m = Object.values(tmp.battleset.team).sort((a, b) => b.power - a.power);
        tmp.imageid = m[0] ? m[0].gsid : '';
        tmp.level = target.level;
        tmp.vip = target.vip;
        tmp.power = target._powerbattleset.pvpdef;
    }
    return tmp;
}
/**
 * 刷新对手
 * @type {exports}
 */
module.exports = exports = async function () {

    const role = this._role;
    const config = global.gameconfig.nmaze.MAP[this.mapid - 1];
    assert(config, 'invalid maze map id');
    const ignore = this.match_records || [];
    ignore.push(role.i());

    const leg = []; // 军团id
    const target = [];
    const oPower = role.getProp(90185);
    for (const { POWER } of config.EACH_STAR) {
        const tmp = await matchOne(POWER.map(p => Math.round((p / 1000) * oPower)), ignore, role.sex, role._gameserv.groupid);
        if (tmp.legion) {
            leg.push(tmp.legion);
        }
        if (tmp.rid) {
            ignore.push(tmp.rid + '');
        }
        target.push(tmp);
    }
    if (ignore.length >= 6) { // 排重重置
        this.match_records = [];
    }
    const legionTmp = {};

    if (leg.length) { // 关联军团名
        const legions = await global.dao.legion.find({ _id: { $in: leg } }, { name: 1 });
        for (const l of legions) {
            legionTmp[l._id] = l.name;
        }
        for (const t of target) {
            t.lname = legionTmp[t.legion];
        }
    }

    // 按战斗力排序, 保证低星的匹配战斗力更低
    target.sort((a, b) => a.power - b.power);

    target.forEach((item, i) => {
        item.star = config.EACH_STAR[i].STAR;
    });

    this.markModified('match_records');
    this.target = target;
}
