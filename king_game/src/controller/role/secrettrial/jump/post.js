'use strict'

/**
 *  获取快速跳转的章节数据
 * @param {*} ctx 
 * @param {*} next 
 */
module.exports = async (ctx, next) => {

    let chapters = {}
    for (let id in ctx.record.passchapter) {
        const { stars } = ctx.record.passchapter[id];
        for (let param of stars) {
            let star = (param.satisfy || []).length; // 一个条件一颗星
            if (star > 0 && star < 3) { // 指要一星或二星的关卡
                if (!chapters[id]) chapters[id] = [];
                chapters[id].push({ levelid: param.levelid, star })
            }
        }
    }

    ctx.body = { chapters };
}