"use strict"

module.exports = async function(role, pid) {
    const config = global.gameconfig.recharge[pid];
    let out = [];
    let exp_byconfig = false;
    if (!config) throw new Error('miss allspecial config:',pid);
    if (config.TYPE === 'RECHARGE') {
        out.push({gsid: 38005, count: config.YB});
        if (config.EXTRA) {
            try {
                role.castItemsNoSave({gsid: config.EXTRA.MARK, count: 1});
                out.push({gsid: 38005, count: config.EXTRA.YB});
            } catch (e) {
            }
        }
        // 充值的经验读取配置表
        exp_byconfig = true;
        role.addItemsNoSave({gsid: 38003, count:config.EXP});
    } else if (config.TYPE === 'RIGHT') {
        let right_config = global.gameconfig.right[pid], buy_exp = false, getReward = false;
        if (!right_config) throw new Error('miss allspecial config:',pid);
        if (right_config.EXP) {
            role.addItemsNoSave({gsid: 38003, count:right_config.EXP});
            buy_exp = exp_byconfig = true;
        }
        if (right_config.REWARD?.length) {
            out.append(right_config.REWARD);
            getReward = true;
        }

        let [_,...info] = pid.split("_");
        let qi = info[info.length - 1];
        for (let i = 0; i < info.length - 1; i++) {
            let prefix = info[i];
            right_config = global.gameconfig.right["special"+prefix + "_" + qi];
            if (!right_config) throw new Error('miss right_config config:',"special"+prefix + "_" + qi);
            // 非自然日
            if (right_config.DAY > 0) {
                role.special[prefix] = Date.now() + right_config.DAY * 24 * 60 * 60 * 1000;
            }else if (right_config.DAY < 0) {
                // 永久特权
                role.special[prefix] = 9999999999999;
            }
            // 自然日(月卡)
            if (right_config.NDAY) {
                let day = role.special[prefix] || 0;
                day += right_config.NDAY;
                role.special[prefix] = day;
            }
            role.markModified('special.' + prefix);
            if (!buy_exp && right_config.EXP) {
                role.addItemsNoSave({gsid: 38003, count:right_config.EXP});
                exp_byconfig = true;
            }
            if (!getReward) {
                out.append(right_config.REWARD);
            }
        }
    }

    return [out,config.PRICE,exp_byconfig]
}