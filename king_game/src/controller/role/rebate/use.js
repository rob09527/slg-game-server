'use strict';
// 充值返利
module.exports = exports = async (ctx, next) => {
    let d = await global.dao.rebate.findOne({uid: ctx.role.uid}) || {};
    ctx.CACHE = {
        // uid: d.uid,
        // rid: d.rid,
        reward: d.reward,
        price: d.price,
        exp: d.exp,
        specialzk: d.specialzk,
        specialgz: d.specialgz,
        specialzz: d.specialzz,
        specialbw: d.specialbw,
        specialqz: d.specialqz,
        specialfd: d.specialfd,
        specialcz: d.specialcz,
        specialcz1: d.specialcz1,
        specialcz2: d.specialcz2,
        specialtower: d.specialtower,
        specialtower1: d.specialtower1,
        specialtower2: d.specialtower2,
    }
    await next();
};
