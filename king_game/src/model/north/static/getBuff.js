const fpool = require("../../../util/random/fpool");

module.exports = async function () {
    const {CONFIG, MAP, BUFF_SKU, BUFF_INFO} = global.gameconfig.north_fight;
    let buffObj = await global.dao.north_buff.findOne();
    const expireAt = buffObj ? buffObj.create + CONFIG.KEEPING * 60 * 1000 : 0;
    if (!buffObj || expireAt < Date.now()) {
        const newBuff = {};
        const buffs = [];
        // 过期了重新生成 buff
        await global.dao.north_buff.deleteMany();
        const selectBuff = {};
        const limitBuff = {}; // 达到上线的buff记录
        for (let i = 0; i < MAP.length; i++) {
            if (MAP[i].BUFF) {
                const BUFF_POOL = BUFF_SKU[MAP[i].BUFF] || [];
                // 过滤达到叠加上线的buff
                const bf = fpool(BUFF_POOL.filter(b => !limitBuff[b.id]), 1, "CHANGE");
                if (bf[0]) {
                    let id = bf[0].ID;
                    buffs.push(...bf.map(b => ({id: id})));
                    selectBuff[id] = selectBuff[id] || 0;
                    selectBuff[id]++;
                    // 达到 buff叠加上线处理
                    if (BUFF_INFO[id] && selectBuff[id] >= BUFF_INFO[id].UP) {
                        limitBuff[id] = 1;
                    }
                }

            }
            newBuff[i] = [...buffs];
        }
        buffObj = {buff: newBuff};
        await global.dao.north_buff.create({buff: newBuff});

    }
    return buffObj;
}
