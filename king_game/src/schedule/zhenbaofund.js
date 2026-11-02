'use strict'

exports.name = "珍宝基金重置";

// 排在每日刷新之后
exports.cron = "1 0 * * *";

exports.main = async function () {
    const cond = {
        'others.98426.count': {
            $gte: 1,
        }
    }
    const udp = {
        $set: {
            // 重新设置开始时间
            zhenbao_fund_start: Date.now() + 60 * 60 * 1000,
        },
        $unset: {
            'others.98425': 1,
            'others.98426': 1,
            zhenbao_fund_buytime: 1,
        }
    }
    await global.dao.role.updateMany(cond, udp);

    
    const cond1 = {
        'others.98428.count': {
            $gte: 1,
        }
    }
    const udp1 = {
        $set: {
            // 重新设置开始时间
            zhenbao_fund_start1: Date.now() + 60 * 60 * 1000,
        },
        $unset: {
            'others.98427': 1,
            'others.98428': 1,
            zhenbao_fund_buytime1: 1,
        }
    }
    await global.dao.role.updateMany(cond1, udp1);
}

exports.check = async function () {
    return true;
}
