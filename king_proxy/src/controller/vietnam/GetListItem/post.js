const _ = require('lodash');
module.exports = async (ctx, next) => {
    let gameservs = Object.values(global.gameservs)
    const game = gameservs[_.random(0, gameservs.length - 1)];
    const items = await game.remote.getGameConfig("vietnam_props_api");
    let list = []
    //策划文档有脏数据。洗一下
    items.forEach(e => {
        if (!list.find(v => e.gsid == v.gsid)) {
            list.push(e)
        }
    });
    console.log(new Date().getTime())
    let data = {
        createtime: 1710904722975,
        updatetime: 1712644445924,//估计写死。提醒对方更新。修改这个时间戳
        items: list
    }
    ctx.body = data
    return
}
