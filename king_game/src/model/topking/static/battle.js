'use strict'

const assert = require('assert');

// 小组赛-淘汰赛
function find_alive_team(bslist) {
    return bslist.find(({team}) => {
        let alive_general = Object.values(team).find(general => general.hppercent > 0);
        return !!alive_general;
    })
}

/**
 *
 * 巅峰赛战斗 移植原生的 API /common/topkingpvp/group/challenge
 * @param role{ {uid: string, servid: number}}
 * @param target {{uid: string, servid: number}}
 * @return {Promise<*|*>}
 */
module.exports = async function (data) {
    let {role,target} = data
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
    let videolist = [];
    let video_version;
    try {
        while (true) {
            // 检查双方是否还有队伍存活
            let player_set = find_alive_team(c_role.c_battleset);
            let target_set = find_alive_team(c_target.c_battleset);
            if (!player_set) {
                win = false;
                break;
            }
            if (!target_set) {
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
                left,
                right,
                lper, rper,
                ltper, rtper,
                report,
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
        }
        win = win ? 'win' : 'lose';
        // 记录录像数据
        videolist = videolist.map(video => JSON.parse(video));
        videolist = JSON.stringify(videolist);
    } catch (e) {
        if (role.bsetpower > target.bsetpower) {
            win = 'win';
        } else {
            win = 'lose'
        }
        videolist = 'fade';
        video_version = 0;
        console.error('TOPKING BATTLE ERROR', role.uid, role.servid, target.uid, target.servid, e);
    }

    // 保存录像格式
    let myVideo = await global.dao.video.create({
        type: 'topkingpvp',
        video: videolist,
        version:video_version
    })

    return {
        win,
        videolist,
        version: video_version,
        vid: myVideo._id
    }

}
