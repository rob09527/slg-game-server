'use strict';

module.exports = exports = async function (ctx, next) {
    const config = global.gameconfig.panda;
    const r = {};
    for (let k in config) {
        let [ok,season,id,start,etime] = ctx.role.isInPanda(k);
        if (ok){
            let d = config[k][season];
            r[k.toUpperCase()] = {
                type: d.type,
                name: d.name,
                time: [start, etime],
                id,
            };
        }
    }

    ctx.body = r;
};
