'use strict';
const randomPool = require('../../../util/random/fpool');
// 卧龙战令激活
module.exports = async function (fieldid, etime) {

    let one = await this.findOne({fieldid, etime: {$gt: Date.now()}});
    if (!one) {
        const b = randomPool(global.gameconfig.chapter_boss_yuangu.BUFF, 1, 'CHANGE');
        one = await this.create({
            fieldid,
            buf:  b[0].ID,
            etime: etime
        });
    }
    return {
        id: await one.buf
    };
};
