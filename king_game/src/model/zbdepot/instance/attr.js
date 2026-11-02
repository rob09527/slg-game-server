
'use strict'

module.exports = function () {
    return global.gameconfig.zhenbao_depot_attr
        .ATTR
        .slice(0, this.lv + 1)
        .reduce((cur, nxt) => {
            Object.entries(nxt)
                .forEach(([k, v]) => {
                    k = k.toLowerCase();
                    cur[k] = cur[k] || 0;
                    cur[k] += v;
                })
            return cur;
        }, {})
}