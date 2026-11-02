
'use strict'
const mazechapterConfig = global.gameconfig.mazechapter;
// 前往下一层
module.exports = exports = async (ctx, next) => {
    let { gatetype } = ctx.request.body;
    ctx.assert(ctx.nowchapter.nextgatetype.includes(gatetype), 'invalid gatetype')
    // 前一层是否都完成
    ctx.assert(ctx.nowchapter.finish, 'floor no finish');
    // 创建下一层
    let chapter = await ctx.dao.mazechapter.create({
        rid: ctx.role._id,
        floor: ctx.nowchapter.floor + 1,
        gateid: gatetype
    });
    // 查出下一层的关卡选择
    let mazeConfigList = mazechapterConfig.deepQuery('PREID', chapter.floor);
    if (mazeConfigList.length > 0) {
        mazeConfigList.forEach(maze => {
            chapter.nextgatetype.push(maze.ID);
        });
        const { REQUIRE_NAME, REQUIRE_COUNT } = gameconfig.function_luck.HELL_DIFF;
        if (ctx.role.getProp(REQUIRE_NAME) < REQUIRE_COUNT || ctx.role.getProp(90459) == 2) {
            // 小于解锁条件,则取普通关卡
            // 或者老用户未通关过第三层普通远征的,则先通关普通远征
            if (chapter.nextgatetype.length > 1) {
                let gates = chapter.nextgatetype;
                gates = Math.min.apply(null, gates);
                chapter.nextgatetype = [gates];
            }
        }
        chapter.markModified('nextgatetype');
    }
    // 查出本层奖励
    // 查出本层的奖励
    let config = mazechapterConfig.deepQueryOne('ID', chapter.gateid);
    ctx.assert(config, 'next gate config err');
    chapter.rewards = config.ITEMS.map(({ GSID, COUNT }) => {
        return {
            gsid: GSID,
            count: COUNT[1]
        }
    });
    // 查出本层随机奖励
    let rate = config.RANDOM_ITEMS.deepMap('W');
    let random_items = config.RANDOM_ITEMS[ctx.random.inweight(rate)];
    random_items = { gsid: random_items.GSID, count: ctx.random.between(random_items.COUNT[0], random_items.COUNT[1]) };
    // 随机奖励添加到本层奖励里
    chapter.rewards.append(random_items);
    chapter.rewards = chapter.rewards.arrange();
    let city = ctx.role.maxmapid.toString().slice(0, 3);
    // 计算冬季加成
    let {season} = ctx.bseason();
    let histpower = ctx.role.getItems(90185).count;
    // 填满节点,传入当前的征战进度
    let typeNodeList = await chapter.fetchNodeEvent(city,season,histpower);
    // 添加到层数选择模板
    ctx.mazeInfo.nodetemplates.push(gatetype);
    ctx.mazeInfo.markModified('nodetemplates');
    ctx.mazeInfo.save();
    chapter.nodes = typeNodeList;
    chapter.markModified('nodes');
    chapter.markModified('rewards');
    chapter.markModified('gateid');
    await chapter.save();
    ctx.body = {}
}