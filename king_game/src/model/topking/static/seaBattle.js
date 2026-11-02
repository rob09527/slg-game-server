'use strict'
const assert = require('assert');

// 海选赛-净胜分值
function find_alive_team(bslist) {
    let temp = bslist.find(({ team }) => {
        let alive_general = Object.values(team).find(general => general.hppercent > 0);
        return !!alive_general;
    })
    if (!temp) temp = 'fade';
    return temp;
}

/**
 *
 * 巅峰赛战斗 移植原生的 API /common/topkingpvp/sea/challenge
 * @param role{ {uid: string, servid: number}}
 * @param target {{uid: string, servid: number}}
 * @return {Promise<*|*>}
 */
module.exports = async function (data) {
    // 获取角色信息
    let {role,target} = data;
    // 获取角色信息
    let c_role = await global.dao.role.findOne({servid: role.servid, uid: role.uid});
    assert(c_role, 'invalid role');
    c_role = c_role.avatarInfo();
    // 赋值阵容
    c_role.c_battleset = [];

    let c_target = await global.dao.role.findOne({servid: target.servid, uid: target.uid});
    assert(c_target, 'invalid target');
    c_target = c_target.avatarInfo();
    role = await this.findOne({uid: role.uid, servid: role.servid});
    target = await this.findOne({uid: target.uid, servid: target.servid});

    // 赋值阵容
    c_target.c_battleset = [];
    // role阵容初始化
    for (let i = 0; i < role.c_battleset.length; i++) {
        // 初始化血量万分比
        for (let general of Object.values(role.c_battleset[i].team)) {
            general.hppercent = 10000;
        }
        c_role.c_battleset.push(role.c_battleset[i]);
    }
    // target 阵容初始化
    for (let j = 0; j < target.c_battleset.length; j++) {
        // 初始化血量万分比
        for (let general of Object.values(target.c_battleset[j].team)) {
            general.hppercent = 10000;
        }
        c_target.c_battleset.push(target.c_battleset[j]);
    }

    // 车轮战
    let win;
    let role_score = 0; // 自身净胜分
    let target_score = 0; // 敌方净胜分
    // let resultlist = [];
    let videolist = [];
    let video_version;
    while (true) {
        // 检查双方是否还有队伍存活
        let player_set = find_alive_team(c_role.c_battleset);
        let target_set = find_alive_team(c_target.c_battleset);
        if (player_set == 'fade') {
            win = false;
            break;
        }
        if (target_set == 'fade') {
            win = true;
            break;
        }
        //  战斗计算
        let battle = new global.dao.c_battle({
            rid: c_role._id,
            type: 'topkingpvp',
            player: player_set,
        })
        await battle.createEnemy(target_set);
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
            },
            'set': player_set,
        }
        let right = {
            info: {
                rname: c_target.rname,
                level: c_target.level,
                iconid: c_target.iconid,
            },
            'set': target_set,
        }
        // 录像正文
        let video = {
            result: battle.result.ret,
            seed: battle.seed,
            season: battle.season,
            rcards:battle.rcards,
            lcards:battle.lcards,
            lper, rper,
            ltper, rtper,
            report,
            left,
            right,
            id: 'fake_video_id',
        }
        videolist.push(JSON.stringify(video));
        // 记录血量
        for (let [pos, hppercent] of Object.entries(lper)) {
            hppercent = battle.result.ret === 'win' ? hppercent : 0;
            player_set.team[pos].hppercent = hppercent;

        }
        for (let [pos, hppercent] of Object.entries(rper)) {
            hppercent = battle.result.ret === 'win' ? 0 : hppercent;
            target_set.team[pos].hppercent = hppercent;

        }
        if (battle.result.ret === 'win') {
            // 左边得1分
            role_score++
        } else {
            // 右边得一分
            target_score++
        }
    }
    // 判断两个小分,不管怎么打最后赢的人都能得3分
    if (win) {
        role_score = 3;
        target_score = Math.min(target_score, 3);
    } else {
        target_score = 3;
        role_score = Math.min(role_score, 3);
    }

    // 记录录像数据
    videolist = videolist.map(video => JSON.parse(video));
    videolist = JSON.stringify(videolist);

    // 保存录像格式
    let myVideo = await global.dao.video.create({
        type: 'topkingpvp',
        video: videolist,
        version:video_version
    })

    return {
        role_score,
        target_score,
        videolist,
        version: video_version,
        vid: myVideo._id
    }

}
