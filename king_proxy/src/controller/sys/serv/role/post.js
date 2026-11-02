'use strict'

module.exports = exports = async function (ctx, next) {
    let {
        servid,
    } = ctx.request.body;
    let ret = true;

    const serv = global.CACHE.gameserver.list[+servid];
    let auto_create = !global.setting.auto_create || global.setting.auto_create == 1; // 全局配置
    if (serv.auto_create) { // 服务器单独配置
        auto_create = serv.auto_create == 1
    }
    let can_create = auto_create || serv.type == 1;  //审核服部限制
    let auto_num = global.setting.auto_num ? global.setting.auto_num : 1000;
    let auto_pay = global.setting.auto_pay ? global.setting.auto_pay : 100;
    if (serv.auto_num) { // 服务器单独配置
        auto_num = serv.auto_num
    }
    if (serv.auto_pay) { // 服务器单独配置
        auto_pay = serv.auto_pay
    }
    let num = (global.serverRoleNum[+servid] || 0) + 1;
    if (can_create) {
        global.serverRoleNum[+servid] = num
    }
    else {
        if (num > auto_num) {
            ret = false; //人满不允许创角
        }
        else{
            global.serverRoleNum[+servid] = num
        }
    }
    ctx.body = {
        success: ret
    };
}
