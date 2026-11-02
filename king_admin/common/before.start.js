const moment = require('moment');
// 初始化
module.exports = async function (app) {
    // 处理一些原生对象封装
    Date.prototype.format = function(formatStr = 'YYYY-MM-DD HH:mm:ss') {
        return moment(this).format(formatStr);
    };
// 转化服务器时区格式
    const timeoffset = Math.floor(new Date().getTimezoneOffset()/60);
    global.TIMEZONE = timeoffset > 0 ? `-${("0"+timeoffset).substr(-2)}:00` : `+${("0"+Math.abs(timeoffset)).substr(-2)}:00`;
    Object.defineProperty(global, 'TIMEZONE', {writable: false});

    // 缓存 角色权限细分的东西
    global.__group__auth__cache__ = {};
}
