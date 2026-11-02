'use strict';

// 军团战信息
module.exports = exports = async (ctx, next) => {
    const { legion: legionId} = ctx.request.body;
    const legion = await ctx.dao.legion.findOne({_id: legionId});

    const roles = await ctx.dao.role.find({_id: legion._members.map(o => o.rid)}, {
        rname: 1,
        iconid: 1,
        rno: 1,
        sex: 1,
        _power: 1,
        _id: 1,
        'battlearr.legionpvp1': 1,
        'battlearr.legionpvp2': 1,
        // 下面是对武将有影响的属性
        general_official: 1,
        hide: 1,
        tech: 1,
        frameid: 1,
        destiny: 1,
    });

    const roleMap = {};
    roles.forEach(r => roleMap[r._id.toString()] = r);

    const formatTeam = (o, generalMap) => {
        let g = {power: -1};
        let totalLevel = 0;
        let count = 0;
        let totalPower = 0;
        const tmp = {};
        for (let k in o.team) {
            const guid = o.team[k];
            if (!generalMap[guid]) {
                continue;
            }
            tmp[k] = generalMap[guid].base();
            if (tmp[k].power > g.power) {
                g = tmp;
            }
            totalLevel += g.level;
            count++;
            totalPower += g.power;
        }
        o.team = tmp;
        o.level = Math.floor(totalLevel / count); // 平均等级
        o.maxGsid = g.gsid; // 最高武将 gsid
        o.totalPower = totalPower; // 总战斗力
        return o;
    };

    const members = legion._members.map(async r => {
        const role = roleMap[r.rid] || {battlearr: {}};
        const t1 = role.battlearr.legionpvp1;
        const t2 = role.battlearr.legionpvp2;
        const allGuids = [];
        if (t1) {
            allGuids.push(...Object.values(t1.team));
        }
        if (t2) {
            allGuids.push(...Object.values(t2.team));
        }
        const generalMap = role.findGenerals ? (await role.findGenerals(allGuids)) : {};

        if (t1) {
            formatTeam(t1, generalMap);
        }

        if (t2) {
            formatTeam(t2, generalMap);
        }
        return {
            pos: r.pos,
            rname: role.name,
            iconid: role.iconid,
            rno: role.rno,
            power: role._power,
            sex: role.sex,
            battlearr: role.battlearr,
        };
    });
    ctx.body = {
        name: legion.name,
        flag: legion.flag,
        level: legion.level,
        power: legion.power,
        members: (await Promise.all(members)).sort((a, b) => b.pos - a.pos)
    };
};
