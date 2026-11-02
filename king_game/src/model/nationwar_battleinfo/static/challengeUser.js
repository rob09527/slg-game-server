
const assert = require('assert');
// 更新国战阵容
module.exports = async function (opt) {

    const { WIN_BASE: win_base, LOSE_BASE: lose_base, ATTCK_CITY: attack_city } = global.gameconfig.nationwar.SCORE
    let { role, target, sid } = opt
    // 获取角色信息
    let c_role =await global.dao.role.getOtherInfoAndBattleSet({ servid: sid, uid: role.uid }, 'nationwar');
    assert(c_role, 'invalid role');
    // 获取对手信息
    let params = {
        uid: target.uid,
        servid: target.servid,
    }
    let c_target =await global.dao.role.getOtherInfoAndBattleSet(params, 'nationwar');
    assert(!c_target.error, 'invalid target');

    // 读取缓存的血量
    //player
    c_role.general_star = 0;
    c_target.general_star = 0;
    for (const guid in role.gcache) {
        const info = role.gcache[guid];
        for (const pos in role.c_battleset.team) {
            const general = role.c_battleset.team[pos];
            if (general.guid !== guid) continue;
            general.hppercent = info.hp;
        }
    }
    // 我方武将星级
    for (const pos in role.c_battleset.team) {
        const general = role.c_battleset.team[pos];
        if (!general) continue;
        c_role.general_star += general.star;
    }

    // 敌方武将星级
    for (const pos in target.c_battleset.team) {
        const general = target.c_battleset.team[pos];
        if (!general) continue;
        c_target.general_star += general.star;
    }
    // target
    for (const guid in target.gcache) {
        const info = target.gcache[guid];
        for (const pos in target.c_battleset.team) {
            const general = target.c_battleset.team[pos];
            if (general.guid !== guid) continue;
            general.hppercent = info.hp;
        }
    }

    let video_version;
    //  战斗计算
    let battle = new global.dao.c_battle({
        rid: c_role._id,
        type: 'nationwar',
        player: role.c_battleset,
    })
    await battle.createEnemy(target.c_battleset);
    battle.season.left = c_role.level;
    battle.season.right = c_target.level;
    await battle.save();
    await battle.cal();
    let {
        lper,
        rper,
        ltper,
        rtper,
        report,
        version,
    } = battle.result;
    battle.result.ret = ltper >= rtper ? 'win' : 'lose';
    await battle.save();
    // 设置录像版本
    if (!video_version) video_version = version;
    // 整理单场录像
    let left = {
        info: {
            rname: c_role.rname,
            level: c_role.level,
            iconid: c_role.iconid,
            frameid:c_role.frameid,
            headid:c_role.headid
        },
        'set': role.c_battleset,
    }
    let right = {
        info: {
            rname: c_target.rname,
            level: c_target.level,
            iconid: c_target.iconid,
            frameid:c_target.frameid,
            headid:c_target.headid
        },
        'set': target.c_battleset,
    }
    // 录像正文
    let video = {
        result: battle.result.ret,
        seed: battle.seed,
        season: battle.season,
        lper, rper,
        ltper, rtper,
        report,
        left,
        lcards:battle.lcards,
        rcards:battle.rcards,
        right,
        id: 'fake_video_id',
    }
    video = JSON.stringify(video);
    let winscore = 0;
    let losescore = 0;
    let live_general_count = 0;// 胜利方存活数据
    let kill_general_count = 0; // 我方击杀敌方武将数
    let gcache = {};
    // 剩余血量回传
    if (battle.result.ret == 'win') {
        // 保存左边的血量lper
        for (const pos in lper) {
            let { guid } = role.c_battleset.team[pos];
            gcache[guid] = gcache[guid] || {};
            gcache[guid].hp = parseInt(lper[pos]) || 0;
            // 敌方击杀我方人数
            if (gcache[guid].hp == 0) kill_general_count++
            // 我方存活武将数
            if (gcache[guid].hp > 0) live_general_count++
        }
        let t_g_star = c_target.general_star - 35 < 0 ? 0 : c_target.general_star - 35;
        let r_g_star = c_role.general_star - 35 < 0 ? 0 : c_role.general_star - 35;

        // 胜利得分
        winscore = Math.floor(win_base * 0.5 * t_g_star / 56 + win_base * 0.5 * r_g_star/ 56)
        winscore = winscore > 0 ? winscore : win_base;

        // 失败得分
        losescore = Math.floor(lose_base * ((kill_general_count + 1) / 7 * 0.45 + r_g_star / 56 * 0.55))
        losescore = losescore > 0 ? losescore : lose_base;
    } else {
        // 保存有变动血量rper
        for (const pos in rper) {
            let { guid } = target.c_battleset.team[pos];
            gcache[guid] = gcache[guid] || {};
            gcache[guid].hp = parseInt(rper[pos]) || 0;
            // 我方击杀武将数
            if (gcache[guid].hp == 0) kill_general_count++
            if (gcache[guid].hp > 0) live_general_count++
        }
        let t_g_star = c_target.general_star - 35 < 0 ? 0 : c_target.general_star - 35;
        let r_g_star = c_role.general_star - 35 < 0 ? 0 : c_role.general_star - 35;

        // 胜利得分
        winscore = Math.floor(win_base * 0.5 * t_g_star / 56 + win_base * 0.5 * r_g_star/ 56)
        winscore = winscore > 0 ? winscore : win_base;

        // 失败得分
        losescore = Math.floor(lose_base * ((kill_general_count + 1) / 7 * 0.45 + r_g_star / 56 * 0.55))
        losescore = losescore > 0 ? losescore : lose_base;
    }

    // 失败分数回传
    return {
        video,
        version: video_version,
        ret: battle.result.ret,
        role_military_level: c_role.military_level,    // 军衔等级
        target_military_level: c_target.military_level, // 军衔等级
        hpper: battle.result.ret == 'win' ? ltper : rtper, // 剩余血量百分比
        gcache, // 武将的剩余血量
        winscore,
        losescore,
        live_general_count, // 胜利方存活数据
        role_general_star: c_role.general_star,
        target_general_star: c_target.general_star,
        l_role:c_role,
        t_role:c_target
    }

}