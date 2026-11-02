'use strict'
const moment = require('moment');
const mazechapterConfig = global.gameconfig.mazechapter;
const ms = require('ms');
// 迷宫(新远征)
module.exports = exports = async (ctx, next) => {
    ctx.hook.pre(EVENT_ENUM.MAZE);
    ctx.assert(false,'no open');// 挺掉老远征接口
    // 计算是否到时间刷新
    ctx.mazeInfo = await ctx.dao.mazeinfo.findOne({ rid: ctx.role._id });
    // 创建卡牌技能组
    ctx.mazecards = await ctx.dao.c_card.findOne({ rid: ctx.role._id, type: 'maze' });
    if (!ctx.mazeInfo || ctx.mazeInfo && ctx.mazeInfo.nextreftime < Date.now()) {
        // 日期到了,刷新记录
        // 移除旧记录
        await ctx.dao.mazeinfo.remove({ rid: ctx.role._id });
        await ctx.dao.mazechapter.remove({ rid: ctx.role._id });
        // 移除远征阵容
        await ctx.dao.role.updateOne({ _id: ctx.role._id }, { $unset: { 'battlearr.maze': 1 } })
        // 移除临时武将
        await ctx.dao.tempgeneral.remove({ rid: ctx.role._id, type: 'maze' });
        // 移除卡牌信息
        await ctx.dao.c_card.remove({ rid: ctx.role._id, type: 'maze' });
        // 移除武将身上的阵容信息
        await ctx.dao.general.updateMany({ rid: ctx.role._id }, { $unset: { 'battleset.maze': 1 } });
        // 移除购买赏金阁的玩家每轮免费使用一次七星灯的标记。
        await ctx.dao.role.updateOne({ _id: ctx.role._id, 'others.90529.count': { $exists: 1 } }, {
            $unset: {
                'others.90529':1
            }
        })
        // 新的迷宫信息
        ctx.mazeInfo = await ctx.dao.mazeinfo.create({
            rid: ctx.role._id,
            nextreftime: whichtime(ctx.role.create)
        });
        // 新卡牌技能组
        ctx.mazecards = await ctx.dao.c_card.create({
            rid: ctx.role._id,
            type: 'maze'
        });
        // 新的迷宫章节
        ctx.mazeChapter = await ctx.dao.mazechapter.create({ rid: ctx.role._id });
        // 查出下一层的关卡选择
        let mazeConfigList = mazechapterConfig.deepQuery('PREID', ctx.mazeChapter.floor);
        ctx.assert(mazeConfigList.length > 0, 'maze chapter err');
        mazeConfigList.forEach(maze => {
            ctx.mazeChapter.nextgatetype.push(maze.ID);
        });
        // 保存关卡id
        ctx.mazeChapter.gateid = ctx.mazeInfo.nodetemplates[0];
        // 查出本层的奖励
        let config = mazechapterConfig.deepQueryOne('ID', ctx.mazeInfo.nodetemplates[0]);
        ctx.mazeChapter.rewards = config.ITEMS.map(({ GSID, COUNT }) => {
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
        ctx.mazeChapter.rewards.append(random_items);
        ctx.mazeChapter.rewards = ctx.mazeChapter.rewards.arrange();
        let city = ctx.role.maxmapid.toString().slice(0, 3);
        // 计算冬季加成
        let { season } = ctx.bseason();
        let histpower = ctx.role.getItems(90185).count
        // 填满节点,传入当前的征战进度
        let typeNodeList = await ctx.mazeChapter.fetchNodeEvent(city, season, histpower);
        ctx.mazeChapter.nodes = typeNodeList;
        ctx.mazeChapter.markModified('nodes');
        ctx.mazeChapter.markModified('rewards');
        ctx.mazeChapter.markModified('nextgatetype');
        ctx.mazeChapter.markModified('gateid');
        await ctx.mazeChapter.save();
    }
    await next();
}
// 计算下次刷新时间戳
let whichtime = (time) => {
    // cycle - 刷新间隔
    let cycle = ms('2d');
    // createDayStart - 角色创建当天00:00
    let createDayStart = moment(time).startOf('day').valueOf();
    // del - 第几次刷新
    const del = (Date.now() - createDayStart) / cycle;
    return createDayStart + Math.ceil(del) * cycle;
}
