
// 定时器

const zhdpoint = require("../util/event/point");

exports.name = "鸿运当头红包刷新"; // 类似一句中文注释，后续后台可以展示该名字,

// 定时器语句
exports.cron = async function () {
    const [, end] = global.config.ZHD['HYDT'] || [];
    if(!global.gameconfig.zhd.HYDT) return null;

    // 不在活动范围内不开启定时器
    if(!end || Date.now() > end) return null;

    const { REFRESH = "0 */2 * * *" } = global.gameconfig.zhd.HYDT;
    return REFRESH;
};

/**
 * 定时器主体函数
 * 异常直接抛出就行
 * @return {Promise<void>}
 */
exports.main = async function () {
     // 刷新鸿运当头
     console.error('SCHEDULEREF HYDTREFRESH START', new Date().toLocaleString());
     if(new Date().getHours() < 1) { // 0点的时候跳过，暂时不处理
        console.error('SCHEDULEREF HYDTREFRESH SKIP');
        return;
     }
     zhdpoint("HYDTREFRESH").catch(console.error);
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}
