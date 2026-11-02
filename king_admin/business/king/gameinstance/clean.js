exports.name = '确认清档';
exports.type = 'N';

const exceptTbale = [
    'gameconfigs'   // 游戏配置
    ,'activities'   // 活动
    ,'gameservers'  // 服务器列表
    ,'whitelists'   // 白名单
    ,'maintains'    // 维护
    ,'notices'      // 公告
    ,'channels'     // 渠道
    ,'hotupds'      // 热更
    ,'iosversions'  // 审核
    ,'rebates'      // 删档测试，返利活动
    ,'sppacks'      // 推送礼包商品
    ,'cdkeys'       // 礼包码
    ,'commodities'  // H5商品
];

exports.exec = async function (body, query, ctx) {
    const {pwd} = body;
    if (pwd != 'yysk1314') {
        throw "口令错误"
    }
    // 清除es
    await this.service.game.cleanAll();
    // 清除redis
    await this.redis.flushall();
    // 清除mongo
    let tables = await this.service.game.collections();
    for(let k in tables){
        const mode = tables[k];
        if(exceptTbale.indexOf(mode.collectionName) >= 0){
            console.log("ignore",mode.collectionName)
            continue;
        }
        else {
            console.log("clear",mode.collectionName)
            mode.drop();
        }
    }
};
