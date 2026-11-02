
'use strict'
const WUJIANG_COND_TYPE = {
    "win": 1,
    "zhenying": 2,
    "zhiye": 3,
    "zhenwang": 4,
    "xueliang": 5,
    "zhenfa": 6,
};

/**
 * 检测战斗获得星级
 * @param {*} result 战斗结果
 * @param {*} battleTeam 战斗阵容
 * @param {*} condIds 条件id列表
 * @returns 
 */
const checkBattleStar = async function ({ result, battleTeam, condIds }) {
    if (!result || !battleTeam || !condIds) return;

    const guids = Object.values(battleTeam.team);
    const selectParam = { _id: 1, gsid: 1, class: 1, level: 1 };
    const generalList = await global.dao.general.find({ _id: { $in: guids } }, selectParam);

    const { STAR_COND: condConfig } = global.gameconfig.secrettrial_chapter;

    const { lper, ltper } = result; // 战斗的结果
    // 不是大于等于的条件判断
    const notGteCondition = [
        WUJIANG_COND_TYPE.zhenwang,
        WUJIANG_COND_TYPE.zhenfa
    ];
    let list = [];
    for (let id of condIds) {
        let config = condConfig[id];
        if (!config) continue;

        let curNum = 0;
        switch (config.TYPE) {
            case WUJIANG_COND_TYPE.win: {
                curNum = 100; // 默认第一个条件是战斗打赢
                break;
            }
            case WUJIANG_COND_TYPE.zhenying: {
                // 上阵武将阵营类型
                generalList.forEach(elem => {
                    let { CAMP } = global.gameconfig.general[elem.gsid];
                    if (+config.SUBTYPE === +CAMP) curNum += 1;
                })
                break;
            }
            case WUJIANG_COND_TYPE.zhiye: {
                // 上阵武将职业类型
                generalList.forEach(elem => {
                    let { OCCU, OCCU2 } = global.gameconfig.general[elem.gsid];
                    if (+config.SUBTYPE == +OCCU || +config.SUBTYPE == +OCCU2) curNum += 1;
                })
                break;
            }
            case WUJIANG_COND_TYPE.zhenwang: {
                // 上阵武将阵亡个数 (统计值为0的个数), 条件是用小于判断
                if (Object.values(lper).filter(elem => !elem).length < +config.COUNT) list.push(id);
                break;
            }
            case WUJIANG_COND_TYPE.xueliang: {
                // 战斗结束我放剩余血量百分比
                curNum = Math.floor(ltper * 100 / 10000); // 百分比%
                break;
            }
            case WUJIANG_COND_TYPE.zhenfa: {
                if ((+battleTeam.zhenfa || -1) == +config.COUNT) list.push(id);
            }
            default:
                break;
        }

        // 校验大于等于的条件判断
        if (notGteCondition.indexOf(config.TYPE) < 0 && curNum >= +config.COUNT) list.push(id);
    }

    return list;
}

module.exports = exports = async (ctx) => {
    let { battleid } = ctx.request.body;
    let battle = await ctx.dao.c_battle.findOne({ _id: battleid });
    ctx.assert(battle, 'invalid battleid');
    await battle.cal();
    let { result } = battle;
    ctx.body = {
        result,
        last: Date.now(),
        satisfy: []
    };

    if (ctx.body.result.ret !== 'win') return;

    // 打赢了才做其他处理
    let battleTeam = ctx.role.battlearr['normal'];
    const { STARCONDID: condIds, FIRSTREWARD: firstRwd } = ctx.chapterBossConf;

    // 校验战斗结果满足几个星级条件
    ctx.body.satisfy = await checkBattleStar({ result, battleTeam, condIds });
    // console.log('<----- battleTeam =', ctx.body.satisfy, condIds);
    ctx.assert(ctx.body.satisfy != undefined, 'invalid satisfy');
    // 是否是新关卡，新关卡即是首胜
    if (ctx.curLevelInfo.satisfy.length < 1) {

        let setUpdate = {
            $set: {}
        };
        // 是否开启新章节
        if (!!ctx.openNewChapter) {
            // 更新当前关卡星级数据
            setUpdate.$set[`passchapter.${ctx.curChapterId}.stars.${ctx.chapterBossConf.levelIndex}.satisfy`] = ctx.body.satisfy;

            // 打赢当前章节的最后一关开启新章节
            ctx.curChapterId += 1;
            const newChapter = global.gameconfig.secrettrial_chapter.CHAPTER[ctx.curChapterId];
            // 如果是最后一章的最后一关通关后设置关卡id不变，反之为新章节的第一关
            if (newChapter) {
                const { BOSS: bosses, BOX: boxs } = newChapter;
                setUpdate.$set.levelid = +bosses[0].BOSSID;
                // 插入开启新章节数据
                setUpdate.$set[`passchapter.${ctx.curChapterId}`] = {
                    stars: [{ levelid: setUpdate.$set.levelid, satisfy: [] }], // 章节所有关卡星级数
                    boxs: boxs.map(elem => 0) // 章节的星级奖励情况
                }
            }
            else {
                let maxChapterId = 0;
                Object.keys(global.gameconfig.secrettrial_chapter.CHAPTER).map(id => {
                    if(+id >= maxChapterId) maxChapterId = +id;
                });
                ctx.curChapterId = Math.min(ctx.curChapterId, maxChapterId);
            }
        }
        else {
            setUpdate.$set.levelid = ctx.curLevelId + 1;
            // 更新当前关卡星级数据
            setUpdate.$set[`passchapter.${ctx.curChapterId}.stars.${ctx.chapterBossConf.levelIndex}.satisfy`] = ctx.body.satisfy;
            // 插入新关卡的星级数据
            setUpdate.$set[`passchapter.${ctx.curChapterId}.stars.${ctx.chapterBossConf.levelIndex + 1}`] = {
                levelid: setUpdate.$set.levelid,
                satisfy: []
            };
        }

        setUpdate.$set.chapterid = ctx.curChapterId;
        await ctx.record.updateOne(setUpdate);

        let items = firstRwd.map(({ GSID, COUNT }) => ({ gsid: GSID, count: COUNT }));

        // 90619标记: 记录当天首次通过的关卡数
        ctx.role.addItemsNoSave([...items, { gsid: 90619, count: 1 }]);

        await ctx.role.save();
        ctx.body.items = items;
    }
    else {
        // 去重新旧星级条件
        let newSatisfy = Array.from(new Set([...ctx.curLevelInfo.satisfy, ...ctx.body.satisfy]));
        // 打通过的关卡更新星级数据即可
        let $set = {
            [`passchapter.${ctx.curChapterId}.stars.$.satisfy`]: newSatisfy
        }
        // console.log('<----- setUpdate old= ', ctx.record._id, $set)
        await global.dao.secrettrial.updateOne({
            _id: ctx.record._id,
            [`passchapter.${ctx.curChapterId}.stars.levelid`]: ctx.curLevelId
        }, $set);
    }

}