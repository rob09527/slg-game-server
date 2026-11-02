'use strict';
// 国战
module.exports = exports = async (ctx, next) => {
    let game_type = 0;
    if (ctx.nationwarInfo){
        game_type = 1; // 后续根据开通玩法类型返回， 1：表示开启的5军之战玩法
    }
    ctx.body = {
        game_type ,
    };
};
