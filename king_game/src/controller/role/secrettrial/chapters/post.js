'use strict'


/**
 * 获取选择章节数据
 * @param {*} ctx 
 * @param {*} next 
 */
module.exports = async (ctx, next) => {

    let chapters = {}
    for (let id in ctx.record.passchapter) {
        let starNum = ctx.record.getchapterstar(id);
        if (!chapters[id]) chapters[id] = { star: 0, isDraw: 0 }
        chapters[id].star = starNum || 0;

        let passInfo = ctx.record.passchapter[id];
        // 是否有可领的宝箱
        const { CHAPTER } = global.gameconfig.secrettrial_chapter;
        const chapterConf = CHAPTER[id];

        //  获取可领取的有哪些
        let meetList = chapterConf.BOX.map(elem => elem && starNum >= +elem.COND ? 1 : 0);
        passInfo.boxs.map((v, i) => {
            if (meetList[i] > v) chapters[id].isDraw = 1;// 1 表示有可领取 0 没有可领取
        })
    }
    ctx.body = { chapters };
}