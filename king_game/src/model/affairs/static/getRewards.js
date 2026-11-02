'use strict'
const random = require('../../../util/random');
const { hitHere } = require("../../../util/weektarget");


const assert = require('assert');
/**
 *
 * 悬赏任务的奖励逻辑（
 * @param missions [{}]
 * @param levelConfig 当前等级配置
 * @param type number 0:单人，1: 团队
 */
module.exports = exports = function (missions, levelConfig, type) {
    let rewards = [];
    // 任务星级
    let missionStar = 0;

    let bossChance = 0; // BOSS 机会，产生的 boss 个数

    // 等级 标记， 和 星级任务完成标记
    let addLevelTags = [
        {GSID: 90444, COUNT: 0},
        {GSID: 90445, COUNT: 0}
    ];

    for (const mission of missions) {
        if (type === 0) {

            // 内政目标活动任务
            const config = global.gameconfig.affairs.deepQueryOne('ID', mission.id);
            if (config) {
                missionStar = (+config.STAR);
                // 星级任务完成标记
                addLevelTags.push({GSID: 90246, COUNT: 1}, {GSID: 90183, COUNT: 1}, {GSID: 90184, COUNT: 1});
                // 当前完成星级为升级要求所需星级，标记自增 (等级标记自增)
                if (missionStar >= levelConfig.MISSION_0 ) addLevelTags[0].COUNT++;
            }
            rewards.push(...mission.reward);
        } else if (type === 1) {
            // 好友团队任务

            const config = global.gameconfig.affairs_f.deepQueryOne('ID', mission.id);
            missionStar = (+config.STAR);
            try {
                // reward
                for (const item of config.ITEMS) {
                    const [min, max] = item.COUNT;
                    rewards.push({
                        GSID: item.GSID,
                        COUNT: random.between(min, max),
                    })
                }
            }catch (e) {
                throw new Error('ERROR AFFAIRS MISSION ID:'+ mission.id );
            }

            // drop
            for (const drop of config.DROPS) {
                const rate = drop.ITEMS.deepMap('W');
                for (let i = 0; i < drop.NUM; i++) {
                    const index = random.inweight(rate);
                    const item = drop.ITEMS[index];
                    assert(item, 'invalid drop');
                    rewards.push({
                        GSID: item.GSID,
                        COUNT: item.COUNT,
                    })
                }
            }
            // 当前完成星级为升级要求所需星级，标记自增
            if (missionStar >= levelConfig.MISSION_1 ) addLevelTags[1].COUNT++;

            // boss 触发
            const isboss = random.hit(config.BOSSRATE, 1000);
            if (isboss) {
                bossChance++; // BOSS 机会++
            }
        }
    }

    return {
        rewards, // 这里只是奖励
        /**
         *  确认领取函数,并处理一些释放事件，和 标记操作等,而且处理了升级逻辑
         * @param role
         */
        confirm: async (role) => {
            if (!rewards.length) { // 没有奖励不往后执行
                return null;
            }
            const bosses = [];
            let upgrade = false;
            while (bossChance > 0) { // 有 boss 机会，匹配 boss
                bossChance--;
                let bossid;
                let bossConfig;
                for (const bid in global.gameconfig.fboss) {
                    const {RANGE, MIN} = bossConfig = global.gameconfig.fboss[bid];
                    const [min, max] = RANGE;
                    if (role.level >= min && role.level <= max) {
                        bossid = bid;
                        break;
                    }
                }
                if (!bossid) {
                    console.warn('miss fboss config at level', role.level);
                } else {
                    let boss = await global.dao.fboss.createBoss(role._id, bossid);
                    boss = boss.base();
                    boss.bset = global.gameconfig.battlefboss[boss.id];
                    boss.lastdamage = 0;
                    boss.team = [];
                    boss.role = {
                        id: role._id.toString(),
                        iconid: role.iconid,
                        headid: role.headid,
                        frameid: role.frameid,
                        rname: role.name,
                        level: role.level,
                        power: role._power,
                        lasttime: role.update,
                    }
                    bosses.push(boss);
                }
            }

            // 标记添加
            role.addItemsNoSave(addLevelTags);
            // 奖励领取
            role.addItemsNoSave(rewards, {main: 'affairs', sec: type === 0 ? 'SOLO' : 'FRIEND'});

            // 下面 处理升级逻辑
            const times0 = role.getItems(90444).count;
            const times1 = role.getItems(90445).count;
            // 达到悬赏升级条件
            if (!levelConfig.TIMES_0 || +levelConfig.TIMES_0 === -1) {
                // 无需升级的配置（达到顶级的标志
            } else if (times0 >= levelConfig.TIMES_0 && times1 >= levelConfig.TIMES_1) {
                role.others[90444] = {count: 0}; // 标记位 归0
                role.others[90445] =  {count: 0};
                role.markModified('others.90444.count');
                role.markModified('others.90445.count');
                role.addItemsNoSave(38012); // 等级自增一
                upgrade = true; // 触发了升级,增加标记字段返回前端
            }
            // 七日目标-悬赏任务完成次数
            hitHere(role, 94204, missions.length, true);
            role.dispatchEvent('EVENT_AFFAIR_' + type, missions.length , missions.map( m => m.id));
            await role.save();

            return {
                bosses,
                rewards,
                upgrade,
                items: [
                    {...role.getItems(90246), gsid: 90246},
                    {...role.getItems(90184), gsid: 90184},
                    {...role.getItems(90183), gsid: 90183},
                    {...role.getItems(90444), gsid: 90444},
                    {...role.getItems(90445), gsid: 90445},
                    {...role.getItems(38012), gsid: 38012},
                ]
            }
        }
    }
}
