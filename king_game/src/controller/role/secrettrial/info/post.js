'use strict'

const _ = require('lodash');
const post = require('../challenge/finish/post');

/**
 *  获取天机试炼信息
 * @param {*} ctx 
 * @param {*} next 
 */
module.exports = async (ctx, next) => {
    let { chapterid, levelid } = ctx.request.body;
    // await test(ctx, 2)
    if (!chapterid) chapterid = ctx.record.chapterid;
    if (!levelid) levelid = 0;
    //console.log('<-----= chapterid = ', chapterid, levelid)

    let chapterInfo = ctx.record.passchapter[chapterid];
    ctx.assert(chapterInfo, 'chapter not unlock');
    // 查找bossid是否存在
    if (!!levelid) {
        const { CHAPTER: chapters } = global.gameconfig.secrettrial_chapter;
        let isExist = chapters[chapterid].BOSS.deepIncludes('BOSSID', levelid);
        ctx.assert(!!isExist, 'levelid nexist');
    }
    let totalStar = ctx.record.getchapterstar(chapterid);

    ctx.body = {
        chapterid,
        levelid,
        ...chapterInfo,
        totalStar
    }
}


async function test(ctx, id) {
    const levelid = 10600
    const { CHAPTER: chapterObj } = global.gameconfig.secrettrial_chapter;
    let isExit = false;
    let $set = { passchapter: {} }
    for (let chapterid in chapterObj) {
        const { BOSS: bossList } = chapterObj[chapterid];

        let chapterInfo = { stars: [], boxs: [0, 0, 0] }
        for (let b = 0; b < bossList.length; b++) {
            let boss = bossList[b];
            if (!boss) continue;
            // 设置通关到此
            chapterInfo.stars[b] = { levelid: +boss.BOSSID, satisfy: [] }
            if (+boss.BOSSID == levelid) {
                $set.chapterid = chapterid;
                $set.levelid = levelid;
                isExit = true; break;
            }
            // 设置满星通此关
            chapterInfo.stars[b].satisfy = boss.STARCONDID;
        }

        $set.passchapter[chapterid] = chapterInfo;
        await ctx.record.updateOne($set);
        // const secretModel = await this.service.game.collection('secrettrials');
        // //let dbInfo = await secretModel.findOne({ rid, type: 'shilian' }, {});
        // r = await secretModel.updateOne({ rid }, { $set });

    }
}



