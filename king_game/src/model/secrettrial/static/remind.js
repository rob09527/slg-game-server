
'use strict'

module.exports = exports = async function ({ role }) {
    if(!role) return 0;
    const dbInfo = await this.findOne({ rid: role.i() },{ passchapter: 1 });
    let secRemind = 0; // 红点标识
    if(dbInfo) {
        const { CHAPTER: chapters } = global.gameconfig.secrettrial_chapter;
        for(let id in dbInfo.passchapter) {
            const { stars, boxs } = dbInfo.passchapter[id];
            const { BOSS, BOX, SWEEP_REWARD } = chapters[id];
            let totalStar = 0; // 章节总星级
            // 是否可以扫荡
            if((SWEEP_REWARD || []).length > 0 && role.getProp(90618) < 1) {
                secRemind = 1; break;
            }

            for(let l = 0; l < stars.length; l++) {
                let { satisfy } = stars[l];
                let { STARCONDID } = BOSS[l];
                // 有可补星
                if(satisfy.length > 0 && satisfy.length < STARCONDID.length) {
                    secRemind = 1; break;
                }
                totalStar += satisfy.length;
            }
            // 有可领取宝箱
            if(!secRemind && totalStar >= BOX[0]?.COND) {
                BOX.map((elem, index)=> {
                    // 未领取且满足条件的宝箱
                    if(elem && !boxs[index] && totalStar >= +elem.COND) {
                        secRemind = 1;
                    }
                })
            }
            // 只要为1就跳出
            if(secRemind) break;
        }
    }

    return secRemind;
}