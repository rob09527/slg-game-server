"use strict"

module.exports = {
    roleLevel(exp) {
        let level = 1;
        const config = global.gameconfig.roleexp;
        while (true) {
            const next = config[level];
            if (!next || exp < next) break;
            exp -= next;
            level++;
        }
        return level;
    },
    roleVip(exp) {
        const config = global.gameconfig.vip.EXP;
        let vip = 0;
        for (let i = 0; i < config.length; i++) {
            const nexp = config[i];
            if (exp < nexp) break;
            vip = i;
        }
        return vip;
    }
}