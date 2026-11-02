'use strict'



/**
 * 报名
 * @type {(function(*): Promise<void>)|*}
 */
module.exports = exports = async function (servid, uid, rid, bsindex = 0) {

    let card = await this.findOne({rid});
    bsindex = Number.parseInt(bsindex);
    if(!card) {
        card = new global.dao.pvpking({
            servid: +servid,
            uid,
            rid
        })
    }
    // 阵容设置前端
    if (!card.bsconfirm[bsindex]) {
        card.bsconfirm[bsindex] = Date.now();
        await card.save();
    }

}
