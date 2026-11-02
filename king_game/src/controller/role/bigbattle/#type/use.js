'use strict';
const moment = require('moment');
const CURRENT_INTERVAL = 30 * 24 * 60 * 60 * 1000;	// 1M


module.exports = exports = async (ctx, next) => {
    let { index } = ctx.request.body;
    const chapterType = ctx.params.type; // [mboss, yuangu]
    ctx.OLD_SUBINDEX = -1; //
    if (chapterType !== 'mboss') {
        ctx._enemy_type = chapterType;
        const type_key = 'chapter_boss_' + chapterType;
        ctx.assert(global.gameconfig[type_key], 'invalid_type'); // 无效的type
        ctx.config = global.gameconfig[type_key]; // 拿到这个玩法的配置
        ctx.assert(ctx.config, 'invalid boss index');


        ctx.record = await ctx.dao.chapterboss.findOne({ type: chapterType, rid: ctx.role._id });
        if (!ctx.record || ctx.record.etime < Date.now()) {
            ctx.assert(ctx.config.AUTO_CREATE, 'no start'); // boss不能自动开始,抛出异常
            // 自动创建
            let etime = 0;
            if (ctx.config.BY_SERVER_TIME) { // 这个自动来控制 玩法时间根据开服来
                const INTERVAL = ctx.config.BY_SERVER_TIME * 24 * 3600 * 1000;
                etime = moment(ctx.role._gameserv.groupstart).startOf('day').valueOf();
                etime = etime + Math.ceil((Date.now() - etime) / INTERVAL) * INTERVAL; // 算出这个周期的结束时间
            }
            if (!ctx.record) {
                // 创建
                ctx.record = new ctx.dao.chapterboss({
                    type: chapterType,
                    rid: ctx.role._id,
                    pass: 0,
                    subindex: ctx.config.DEFAULT_BOSS_ID,
                    etime,
                    update: Date.now(),
                });
                ctx._IS_INIT_ = true; // 标记是 初始化
            } else {
                if (chapterType === 'yuangu') { // 远古战场 特殊刷新逻辑，刷新上一次停留难度
                    // ctx.config.BOSS[nextId]
                    let INIT_INDEX = Math.floor(ctx.record.subindex / 1000000) * 1000000 + 1001;
                    if (ctx.record.pass) { // 上一次已经通关
                        let NEXT_LV_INIT_INDEX = INIT_INDEX + 1000000;
                        if (ctx.config.BOSS[NEXT_LV_INIT_INDEX]) { // 如果下一个难度 还有配置就进入下一个难度否则继续 当前难度
                            INIT_INDEX = NEXT_LV_INIT_INDEX;
                        }
                    }
                    ctx.record.subindex = INIT_INDEX;
                } else {
                    ctx.record.subindex = ctx.config.DEFAULT_BOSS_ID;
                }
                // 刷新
                ctx.record.pass = 0;
                ctx.record.etime = etime;
                ctx.record.update = Date.now();
                ctx.record.lastdamge = 0;
                ctx.record.totaldamge = 0;
                ctx._IS_INIT_ = true;  // 标记是 初始化
            }
            await ctx.record.save();
        }

        //  通过 关卡id(subindex) 来定位boss 配置
        ctx.chapter = ctx.config.BOSS[ctx.record.subindex];
        ctx.OLD_SUBINDEX = ctx.record.subindex; // 记录过关之前的关卡id
        ctx.chapter.MUST_WIN ? (ctx.battletype = 'lmonster') : (ctx.battletype = 'mboss');

        if (chapterType === 'yuangu') {  // 处理远古挑战结束的特殊逻辑
            if (ctx._IS_INIT_) {
                // 初始化时删除 以前的buff
                await ctx.dao.yuangubuf.deleteMany({ etime: { $lt: Date.now() } }).catch(console.log);
                if (ctx.config._buff_cache_time && ctx.config._buff_cache_time < ctx.record.etime) {
                    ctx.config._field_info = null;
                    ctx.config._buff_cache_time = 0;
                }
            }
            // 远古战场的敌军buff逻辑
            const mapid = Math.floor(ctx.record.subindex / 1000);
            const buf = await ctx.dao.yuangubuf.getBuff(mapid, ctx.record.etime);
            ctx.chapter.RCARDS = [buf]; // 拿到敌方buf

            ctx.handle_challenge_callback = () => {
                // 处理特殊的返回格式,需分开返回首通奖励，和击杀奖励
                if (!ctx.body.kill) {
                    return;
                }
                // 击杀
                ctx.body.reward = ctx.chapter.REWARDS;
                let OLD_LV = 0; // 难度
                let OLD_FIELD = 0; // 战场
                // subindex 格式说明, 1,001,001 分别是 难度,地图,关卡 (因此，该设计也限制了 地图和关卡的最高量级不能操作 998
                if (!ctx.config.BOSS[ctx.record.subindex]) { // 当前关卡之后的一关没有配置，说明得跳图了
                    OLD_FIELD = Math.floor(ctx.record.subindex / 1000);
                    let nextId = (OLD_FIELD + 1) * 1000 + 1; // 进入下一张地图的第一关
                    if (!ctx.config.BOSS[nextId]) { // 如果该地图配置也不存在，则说明 难度通关
                        OLD_LV = Math.floor(ctx.record.subindex / 1000000);
                        ctx.record.pass = 1;
                        ctx.record.subindex--; // 通关难度没有下一关了，回退1，并且标记已经通关
                    } else {
                        ctx.record.subindex = nextId; // 修改 关卡id 为对应关卡 对应难度的id
                    }
                }
                if (!ctx.is_first) { // 不是首通
                    const drop = ctx.chapter.DROP; // 后续挑战掉落奖励
                    if (!drop) return;
                    const p = ctx.random.fpool(ctx.config.DROP_POOL.filter(p => p.ID === drop), 1);
                    if (!p[0]) return;
                    const items = p[0].ITEMS;
                    ctx.body.items.append(items);
                    ctx.body.reward = [...ctx.body.reward, ...items]; // 掉落奖励返回
                    return;
                }
                // 第一次击杀
                ctx.body.reward = ctx.chapter.FIRST_REWARDS;
                if (OLD_FIELD) { // 第一次战场通过奖励
                    ctx.body.fieldreward = ctx.config.FIELD_REWARD[OLD_FIELD];
                    if (ctx.body.fieldreward) { // 略微判断一下，避免这一关没有配置 战场奖励
                        ctx.body.items.append(ctx.body.fieldreward);
                        ctx.body.items.arrange();
                    }
                }
                if (OLD_LV) { // 第一次跳难度，返回难度奖励
                    ctx.body.lvreward = ctx.config.LV_REWARD[OLD_LV];
                    if (ctx.body.lvreward) { // 略微判断一下，避免这一关没有配置 难度奖励
                        ctx.body.items.append(ctx.body.lvreward);
                        ctx.body.items.arrange();
                    }
                }
            };
        }


    } else {
        // 月度boss和 征战限时boss的玩法 都用 mboss的逻辑
        ctx.cyclenum = Math.ceil((Date.now() - ctx.role.create) / CURRENT_INTERVAL);

        index = parseInt(index) || 0;
        if (index >= 3) {
            ctx.config = global.gameconfig.boss_time_limit[index]; // 限时 boss
            ctx._enemy_type = 'lmboss'; // 阵容取 lmboss 的数据
            // 限时 boss
            ctx.record = await ctx.dao.timeplay.findOne({ rid: ctx.role._id, index });
            ctx.assert(ctx.record, 'no start'); // 限时战役 boss不能自动开始
            // ctx.assert(ctx.record.etime > Date.now(), 'end'); // 限时战役 boss 结束不能继续挑战, 去掉过期时间限制
            ctx.chapter = ctx.config[ctx.record.subindex];
            console.log("record", ctx.record, ctx.record.subindex, ctx.config, ctx.chapter, "index", index,)
            ctx.assert(ctx.chapter, 'invalid chapter');
            // 如果一定要击杀的小怪，战斗类型为 lmonster
            ctx.chapter.MUST_WIN ? (ctx.battletype = 'lmonster') : (ctx.battletype = 'lmboss');

            // 解锁限时任务和限时兑换
            ctx.handle_challenge_callback = () => {
                if (!ctx.body.kill) {
                    return;
                }
                const taskExpire = global.gameconfig.chapter_new_event.TASK_UNLOCK[ctx.chapter.ID];
                const t = Date.now();
                if (taskExpire) { // 解锁限时任务
                    ctx.record.task_time = {
                        start: t,
                        etime: t + taskExpire.EXPIRE * 1000
                    }
                    // 进度缓存进入 redis ，废弃查ES的方案
                    const KEY = `KING:NEVENT:${ctx.role._id}`;
                    global.redis.hmset(KEY, index, ctx.record.task_time.etime);

                }

                const exchangeExpire = global.gameconfig.chapter_new_event.EXCHANGE_UNLOCK[ctx.chapter.ID];

                if (exchangeExpire) { // 解锁限时任务
                    ctx.record.exchange_time = {
                        start: t,
                        etime: t + exchangeExpire.EXPIRE * 1000
                    }
                }
            }
        } else {
            ctx.hook.pre(EVENT_ENUM.BIGBATTLE);
            ctx.config = global.gameconfig.bossmonthly[index];
            ctx.assert(ctx.config, 'invalid bosstype');
            const current_index = ctx.cyclenum % ctx.config.length;
            ctx.config = ctx.config[current_index];
            ctx.assert(ctx.config, 'invalid cycle');

            ctx.battletype = 'mboss';
            ctx._enemy_type = 'mboss';
            ctx.record = await ctx.dao.mboss.findOne({ rid: ctx.role._id, index });
            if (!ctx.record) {
                ctx.record = new ctx.dao.mboss({ rid: ctx.role._id, index });
            }
            if (ctx.record.etime < Date.now()) {
                ctx.record.subindex = 0;
                ctx.record.totaldamge = 0;
                ctx.record.lastdamge = 0;
                ctx.record.etime = ctx.role.create + ctx.cyclenum * CURRENT_INTERVAL;
                await ctx.record.save();
            }
            ctx.chapter = ctx.config[ctx.record.subindex];
            ctx.assert(ctx.chapter, 'invalid chapter');
        }
        ctx.request.body.subindex = ctx.record.subindex;
    }


    await next();
};
