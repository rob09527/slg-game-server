'use strict';

module.exports = exports = async (ctx) => {
    console.log('config文件到来 ', global.gameconfig.secretRealm[0][0].ID)
    let data = {
        //创生柱
        secretRealm: global.gameconfig.secretRealm,
        //秘境规则
        secretRealmGz: global.gameconfig.secretRealmGz,
        //秘境精灵
        secretRealmjl: global.gameconfig.secretRealmjl,
        secretRealmTask: global.gameconfig.secretRealmTask,
        //问鼎九州
        secretRealmWdjz: global.gameconfig.secretRealmWdjz
    }
    ctx.body = data
};
