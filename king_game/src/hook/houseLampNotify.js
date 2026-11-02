/**
 * 跑马灯通知
 * @param type {string|number}
 * @param count {number}
 */
module.exports = async function (type, count) {

    const lampConfig = gameconfig.horse_race_lamp[type];
    if (!lampConfig) {
        return;
    }

    if (this.role._NO_LAMP_) { // 如果标记了 不进行跑马灯公告的，则不进行全服跑马灯通知
        return;
    }
    for (const c of lampConfig) { // 同一个触发类型可能有多个条件值
        if (!c.REQUIRE) {
            continue;
        }
        let ok = false;
        if (c.REQUIRE.EQ !== undefined) {
            ok = c.REQUIRE.EQ === count;
        } else if (c.REQUIRE.GT !== undefined) {
            ok = count > c.REQUIRE.GT;
        } else if (c.REQUIRE.LT !== undefined) {
            ok = count < c.REQUIRE.LT;
        }

        if (!ok) {
            continue;
        }
        const GSID = this.role[`${type}_GSID`] || type; // 有可能 关系 gsid 不是 type，而是其他的情况，所以兼容获取
        let msg = c.TEXT.replace('{rname}', this.role.rname)
            .replace('{count}', count).replace('{gsid}', `{${GSID}}`);
        // 如果跑马灯文案有更多内容，可以使用如下逻辑，但是在数据生成的地方得构造 PARAMS
        const PARAMS_KEY = type + '_PARAMS';
        if (this.role[PARAMS_KEY]) {
            for (let k in this.role[PARAMS_KEY]) {
                msg = msg.replace(`{param${k}`, this.role[PARAMS_KEY][k]);
            }
        }

        console.log(this.role.rno, 'HOUSE_LAMP_TO_ALL', msg);
        // 如果达成这个条件，则通知全服
        global.remote.pushClientAll(this.role._gameserv.groupid, {
            type: 'house-lamp', // 跑马灯类型
            content: msg,
            count: count,
            gsid: GSID // 告知前端跑马灯需要替换的 gsid
        });
    }
};
