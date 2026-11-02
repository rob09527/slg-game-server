'use strict'

const assert = require('assert')
module.exports = exports = async function (rid, chapterId, type = 'shilian') {

    const { CHAPTER: chapters } = global.gameconfig.secrettrial_chapter;

    chapterId = !chapterId ? 1 : chapterId;
    const config = chapters[chapterId];
    assert(config, 'config not exist');

    const { BOSS: bosses, BOX: boxs } = config;

    assert(bosses, 'config bosses error');
    assert(boxs, 'config boxs error');

    let data = {
        rid,
        type,
        chapterid: chapterId, // 章节id
        levelid: bosses[0].BOSSID,
        passchapter: {
            [chapterId]: {
                stars: [{ levelid: +bosses[0].BOSSID, satisfy: [] }], // 章节所有关卡星级数
                boxs: boxs.map(elem => 0) // 章节的星级奖励情况
            }
        }
    }

    return this.create(data);
}