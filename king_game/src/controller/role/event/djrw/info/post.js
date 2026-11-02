
'use strict'
// 点将任务
module.exports = exports = async function (ctx, next) {

    const {
        MISSIONS,
    } = ctx.config;
    ctx.body = MISSIONS.map(mission => {
        let {
            CHK,
            MARK,
            NAME: name,
            ITEMS: items,
        } = mission;
        let status = 0;
        if (ctx.role.getItems(MARK).count >= 1) {
            status = 2
        } else {
            let fullfill = CHK.every(({MARK, NUM}) =>{
                return ctx.role.getItems(MARK).count >= NUM;
            })
            if (fullfill) status = 1;
        }
        return {
            chk: CHK,
            name,
            items,
            status,
        }
    })
}
