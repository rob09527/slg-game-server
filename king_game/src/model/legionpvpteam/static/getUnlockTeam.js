'use strict';

const bseason = require('./../../../util/battleseason');
/**
 * 获取未被锁定的军团阵容数据
 * @param legion {object} 军团对象
 * @param role? {role} role对象（用于绑定自身的buff用于返回
 * @param MAX_GSID_INFO {boolean} 是否计算队伍平均等级
 * @return {Promise<{top: *[], mid: *[], down: *[]}>}
 */
module.exports = async function (legion, role = undefined,MAX_GSID_INFO = false) {
    if (!global.gameconfig.LEGIONWARMOB) { // 将军团战 野怪格式化为 map结构
        global.gameconfig.LEGIONWARMOB = {};
        global.gameconfig.legionwarmob.forEach(boss => {
            global.gameconfig.LEGIONWARMOB[boss.ID] = boss;
        });
    }
    const membersMap = {};
    const members = legion._members.map(m => {
        membersMap[m.rid] = m.pos;
        return m.rid;
    });
    const team = await global.dao.role.find({
        _id: {
            $in: members,
        },
        $or: [
            {'battlearr.legionpvp1.camp': {$exists: true}},
            {'battlearr.legionpvp2.camp': {$exists: true}},
        ],
    }, {
        'battlearr.legionpvp1': 1,
        'battlearr.legionpvp2': 1,
        rname: 1,
        iconid: 1,
        rno: 1,
        sex: 1,
        _id: 1,
        rid: 1,
        // 查询几个对武将属于有加成的属性，其他用户属性就不查了
        general_official: 1,
        hide: 1,
        tech: 1,
        frameid: 1,
        imageid: 1,
        mythical: 1,
        destiny: 1,
    });
    // specialbuff
    const bufflist = await global.dao.lwmob.find({
        rid: {$in: members},
        kill: {$exists: true},
    }, {mobid: 1, rid: 1, pos: 1, totaldamage: 1}); // 找出所有参战成员buff情况
    const buffMap = {};

    bufflist.forEach(b => {
        buffMap[b.rid] = buffMap[b.rid] || [];
        buffMap[b.rid].push(...global.gameconfig.LEGIONWARMOB[b.mobid].ATTR);

    });
    if(role){
        role._my_buff_ = buffMap[role.i()];
    }
    const legionboss = await global.dao.lwmboss.findOne({legion: legion._id.toString()}, {totaldamage: 1});
    const legionbuff = [];
    if (legionboss) { // 有击杀记录
        const totaldamage = legionboss.totaldamage; // 总大BOSS伤害量
        const {season} =  bseason();
        const seasonboss = global.gameconfig.legionwarmobboss.find(b => b.SEASON == season);
        for (const stage of seasonboss.STAGE) {
            if(totaldamage < stage.DAMGE){
                break;
            }
            legionbuff.push(stage.ATTR);
        }
    }

    // 转换阵法结构
    const parseZhenfa = async (teamSet)=> {
        if (!teamSet.zhenfa) {
            return;
        }
        let zhenfa = await global.dao.zhenfa.getZf(teamSet._role.rid, teamSet.zhenfa);
        if (!zhenfa) {
            return;
        }
        zhenfa = zhenfa.info();
        teamSet.zhenfa = {
            id: zhenfa.id,
            lv: zhenfa.lv,
            skillID: zhenfa.skillID,
            pos: zhenfa.pos,
            pickAttr: zhenfa.pickAttr,
        }
    }
    const camps = {top: [], mid: [], down: []};
    for (const c of team) {
        const roleinfo = {
            rname: c.name,
            rno: c.rno,
            sex: c.sex,
            pos: membersMap[c._id.toString()],
            rid: c._id.toString(),
            level: c.level,
            iconid: c.iconid,
            imageid: c.imageid,
            frameid: c.frameid,
        };
        const allGuids = [];
        let t1;
        let t2;

        if (c.battlearr.legionpvp1 && c.battlearr.legionpvp1.camp) {
            t1 = {...c.battlearr.legionpvp1, _role: roleinfo, rolebuff:  buffMap[roleinfo.rid] };
            camps[t1.camp] = camps[t1.camp] || [];
            camps[t1.camp].push(t1);
            await parseZhenfa(t1);
            if (t1.mythic && c.mythical[t1.mythic]) {
                const tid = t1.mythic;
                t1.mythic = c.mythical[t1.mythic];
                t1.mythic.tid = tid;
            }
            allGuids.push(...Object.values(t1.team));
        }
        if (c.battlearr.legionpvp2 && c.battlearr.legionpvp2.camp) {
            t2 = {...c.battlearr.legionpvp2, _role: roleinfo, rolebuff:  buffMap[roleinfo.rid]  };
            await parseZhenfa(t2);
            camps[t2.camp] = camps[t2.camp] || [];
            camps[t2.camp].push(t2);
            if (t2.mythic && c.mythical[t2.mythic]) {
                const tid = t2.mythic;
                t2.mythic = c.mythical[t2.mythic];
                t2.mythic.tid = tid;
            }
            allGuids.push(...Object.values(t2.team));
        }

        const gmap = await c.findGenerals(allGuids);
        if (t1) {
            const newTeam = {};
            for (let k in t1.team) {
                const guid = t1.team[k];
                if (gmap[guid]) {
                    newTeam[k] = gmap[guid].base();
                }
            }
            t1.team = newTeam;
            MAX_GSID_INFO && this.getMaxGeneralForTeam(t1);
        }
        if (t2) {
            const newTeam = {};
            for (let k in t2.team) {
                const guid = t2.team[k];
                if (gmap[guid]) {
                    newTeam[k] = gmap[guid].base();
                }
            }
            t2.team = newTeam;
            MAX_GSID_INFO && this.getMaxGeneralForTeam(t2);
        }
    }

    camps.legionbuff = legionbuff; // 军团 buff
    return camps;
};
