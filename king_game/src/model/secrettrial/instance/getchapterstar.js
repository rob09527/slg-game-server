'use strict'
/**
 * 获取单个或所有章节的星级数
 */
module.exports = exports = function (chapterid) {
    let total = 0;
    const totalFun = (chapter) => {
        if (!chapter || !chapter.stars) return;

        for (let param of chapter.stars) {
            total += (param.satisfy || []).length; // 一个条件一颗星
        }
    }
    if (chapterid) {
        totalFun(this.passchapter[chapterid])
    }
    else {
        for (let id in this.passchapter) {
            totalFun(this.passchapter[id])
        }
    }

    return total;
}