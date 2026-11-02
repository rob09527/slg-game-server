'use strict';

const moment = require('moment');
const CAMPS = ['top' , 'mid' , 'down' ];
const opponentInfo = require('../opponent/post');

// 军团战信息
module.exports = exports = async (ctx, next) => {
    const {MATCH, LOCK_TEAM, START_FIGHT} = global.gameconfig.legionpvp.CONFIG;

    // 下面逻辑是找出当期 的期号, 期号是匹配日当天的
    let now = new Date();
    let DAY = MATCH.split(' ').pop().split(',');
    while (!DAY.includes(now.getDay().toString())) {
        now.setDate(now.getDate() - 1);
    }
    const todayPvpDate = moment(now).format('YYYY-MM-DD');
    const {pvpDate = todayPvpDate} = ctx.request.body;
    const legionId =  ctx.role.legion;

    const info = ctx.legion.pvpinfo ;
    console.log('debug pvpDate',todayPvpDate, pvpDate);
    ctx.assert(info, 'no register legion');
    const pvpInfo = await ctx.dao.legionpvp.findOne({legion: legionId, pvpDate});
    if (!ctx.request.body.pvpDate){
        now.setDate(now.getDate() - now.getDay() + 1); // 把时间调到星期1
        now.setHours(0, 0, 0, 0);
        const lastWeekEnd = now.getTime();
        now.setDate(now.getDate() - 7);
        const lastWeekStart = now.getTime();
        const MAX_AVA_TIMES = MATCH.split(' ').pop().split(',').length;
        let requireActive = false; // 军团战条件是否满足
        if(info.availableTimes > MAX_AVA_TIMES){
            requireActive = true;
        }else if(lastWeekStart <= info.lastRegister && info.lastRegister < lastWeekEnd && info.availableTimes > 0){
            requireActive = true;
        }
        ctx.assert(pvpInfo, requireActive ? 'not start' : 'not register');

    } else {
        ctx.assert(pvpInfo, 'no pvp info');

    }

    const opponentId = pvpInfo.legion.find(o => o != legionId);
    // 获取对手信息
    let opponent = null;

    const opponentInfo = opponentId ? await ctx.dao.legion.findOne({_id: opponentId}): null;

    if (opponentInfo) {
        opponent = {};
        // 查询对手信息
        const s = await ctx.dao.gameserver.findOne({servid: opponentInfo.servid}, {name: 1});
        Object.assign(opponent, {
            level:opponentInfo.level,
            flag:opponentInfo.flag,
            servid: opponentInfo.servid,
            sname: s && s.name,
            demonstrate: opponentInfo.demonstrate,
            name: opponentInfo.name
        });
        const team = await ctx.dao.legionpvpteam.findOne({legion: opponentId, pvpDate}); // 查询对手的整容
        if (team) {
            const camps = team.team;
            opponent.camps = camps;
            camps.specialbuff = undefined;
            opponent.specialbuff =  camps.specialbuff
        } else { // 没有锁阵容，要查询实时的军团战阵营数据
            let teamInfo = await ctx.dao.legionpvpteam.getUnlockTeam(opponentInfo);
            opponent.camps = teamInfo
            opponent.specialbuff = teamInfo.legionbuff;
            teamInfo.legionbuff = undefined;
        }

        for (const c of CAMPS) { // 查询对手整容，对手整容只展示
            if (!opponent.camps[c]) {
                continue;
            }
            const oneTeam = opponent.camps[c];
            oneTeam.forEach((o) => {
                ctx.dao.legionpvpteam.getMaxGeneralForTeam(o);
                o.team = null; // 不把对手具体整容返回回去
            })
        }
        opponent.pvpscore = opponentInfo.pvpscore;
        opponent.power = opponentInfo.power;
        opponent.legion = opponentInfo._id;
    }


    const pvpscore = ctx.legion.pvpscore;
    // 获取布阵整容，没到整容锁定时间获取到为 null
    const team = await ctx.dao.legionpvpteam.findOne({legion: legionId, pvpDate});
    const camps = team ? team.team : null;
    if (camps){
        for (const c of CAMPS) {
            if (!camps[c]) {
                continue;
            }
            const oneTeam = camps[c];
            oneTeam.forEach(ctx.dao.legionpvpteam.getMaxGeneralForTeam);
        }
    }


    let pvpDay = new Date(pvpDate);
    const lockCron = LOCK_TEAM.split(' ');
    DAY = lockCron.pop().split(','); // 找出当前期的锁整容时间
    while (!DAY.includes(pvpDay.getDay().toString())) {
        pvpDay.setDate(pvpDay.getDate() + 1);
    }
    pvpDay.setHours(+lockCron[2], +lockCron[1], +lockCron[0]);

    const locktime = pvpDay.getTime(); // 锁整容时间

    pvpDay = new Date(pvpDate);
    const fightCron = START_FIGHT.split(' ');
    DAY = fightCron.pop().split(','); // 找出当前期的开战时间
    while (!DAY.includes(pvpDay.getDay().toString())) {
        pvpDay.setDate(pvpDay.getDate() + 1);
    }
    pvpDay.setHours(+fightCron[2], +fightCron[1], +fightCron[0]);
    const startpvptime = pvpDay.getTime(); // 开战时间

    const legionpvpInfo = {
        pvpscore,
        camps,
        opponent,
        startpvptime ,
        locktime ,
        report: pvpInfo.report,
        specialbuff: team && team.specialbuff
    };

    /*              ----     上面是common 转移过来的代码体           -----           */


    if (!legionpvpInfo.camps) { // 如果没有锁定整容，则查询成员目前所设置的整容
        ctx.MAX_GSID_INFO = true; // 申明需要最高战力武将信息，平均等级的计算
        const unlockTeam = await ctx.dao.legionpvpteam.getUnlockTeam(ctx.legion, ctx.role);
        legionpvpInfo.camps = unlockTeam;
        legionpvpInfo.specialbuff = legionpvpInfo.camps.legionbuff; // 全局 buff 放在最外层
        legionpvpInfo.camps.legionbuff = undefined;
        const bosslist = [];
        const ignoreBoss = {};
        for (let i = 0; i < 3; i++) {
            const b  = await ctx.dao.lwmob.fetch(ctx.role._id, i, ignoreBoss);
            ignoreBoss[b.mobid] = 1;
            const cfg = global.gameconfig.LEGIONWARMOB[b.mobid];
            bosslist.push({pos: b.pos, mobid: b.mobid, totaldamage: b.totaldamage, lastdamage: b.lastdamage, totalHp: cfg.HP});
        }
        legionpvpInfo.boss = bosslist;
        legionpvpInfo.ownerbuff = ctx.role._my_buff_; // 把个人 buff 赋值到最外层，方便前端获取
    } else {
        legionpvpInfo.lockteam = true; // 表示阵容已经被锁定了
    }

    const onwerId = ctx.role.i();
    for (let k of CAMPS ){
        const camp = legionpvpInfo.camps[k];

        for (const one of camp) {
            if(!one){
                continue;
            } else if(!one.team){
                continue;
            }
            if (!legionpvpInfo.ownerbuff && one._role && one._role.rid === onwerId){ // 如果是个人
                legionpvpInfo.ownerbuff = one.rolebuff || []; // 锁定了阵容，ownerbuff 需要从阵容里面获取
            }

            for (const pos in one.team) {
                if(!one.team[pos]){
                    continue;
                }
                const g = one.team[pos]; // 减少武将字段的返回
                one.mythic = one.mythic && one.mythic.tid ? one.mythic.tid : one.mythic;
                one.team[pos] = {
                    gsid: g.gsid,
                    guid: g.guid,
                    level: g.level,
                    power: g.power
                }
            }
        }
    }
    ctx.body = legionpvpInfo;
};
