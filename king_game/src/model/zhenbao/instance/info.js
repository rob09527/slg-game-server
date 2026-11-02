
'use strict'

const { ok } = require("assert");

/**
 * 根据传入的角色数据返回增幅属性
 * @param {object} attr 传入的属性对象
 * @returns object
 */
const zhenfu_attr_add = function (attr = {}) {
    // 判断是否有角色对象
    if (!this._role) return attr;
    // 判断角色ID是否一致
    if (this._role.i() !== this.rid) return attr;
    // 获取增幅加成配置
    const extra_config = global.gameconfig
        .zhenbao_item?.[this.zbId]?.EXCLU;
    if (!extra_config) return attr;
    const {
        MISSION,
    } = extra_config;
    return MISSION.reduce((cur, missionid) => {
        const mission_config = global.gameconfig
            .zhenbao_mission[missionid];
        if (!mission_config) return cur;
        const {
            FINISH,
            FINISH_NUM = Number.POSITIVE_INFINITY,
            ATTR,
        } = mission_config;
        // 是否激活,强化不满足不能激活,所以直接判断是否激活即可
        if (this._role.getProp(FINISH) < FINISH_NUM) return cur;
        for (let [key, val] of Object.entries(ATTR)) {
            key = key.toLowerCase();
            attr[key] = attr[key] || 0;
            attr[key] += val;
        }
        return cur;
    }, attr)
}

/**
 * 返回珍宝属性
 * @param {Boolean} ignoreEnhance 是否忽略增幅数据
 * @returns 
 */
module.exports = function (ignoreEnhance) {
    const config = global.gameconfig.zhenbao_str[this.zbId];
    ok(config, 'invalid zbId');
    let attr = config
        .slice(0, this.slv + 1)
        .reduce((cur, { ATTR }) => {
            Object.entries(ATTR)
                .forEach(([k, v]) => {
                    k = k.toLowerCase();
                    cur[k] = cur[k] || 0;
                    cur[k] += v;
                })
            return cur;
        }, {})
    // 忽略增强属性
    if (!ignoreEnhance) attr = zhenfu_attr_add.call(this, attr);
    return {
        slv: this.slv,
        attr,
        skill: config[this.slv].SKILLID || undefined,
    }
}