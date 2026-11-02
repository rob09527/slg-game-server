'use strict';
/**
 * 红点数量递减
 *
 * @param remind {object}
 * @param ctx{ object}
 */
module.exports = exports = async (ctx) => {
    /**
     * @example
     *  {
     *      'hd.ydhd': 1,  //  格式1
     *      hd: {          //  格式2
     *          ydhd: 1
     *      }
     *  }
     */
    let {remind} = ctx.request.body;
    ctx.assert(typeof remind === 'object', 'invalid reminds');
    const updateInc = {};
    for (let key in remind){

        let m = remind[key];
        if (typeof m === 'object'){
            for (let k2 in m){
                let type = `${key}_${k2}`;
                const count = -(m[k2] || 1);
                updateInc[`remind.${type}`] = count;
            }
        } else {
            let type = key.replace('.', '_');
            const count = -(m || 1);
            updateInc[`remind.${type}`] = count;
        }
    }
    ctx.assert(Object.keys(updateInc).length, 'empty set');

    await ctx.dao.remind.updateOne({
        rid: ctx.role.i() },
        {$inc: updateInc });

    const newRemind = await ctx.dao.remind.findOne({rid: ctx.role.i()});
    const otherRemind = {};

    for (let k in newRemind.remind) {
        let [k0, k1] = k.split('_');
        otherRemind[k0] = otherRemind[k0] || {};
        otherRemind[k0][k1] = newRemind.remind[k] > 0 ? newRemind.remind[k] : 0;
    }
    ctx.body =  otherRemind;
};
