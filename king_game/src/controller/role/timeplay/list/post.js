'use strict';
const { hitHere } = require("../../../../util/weektarget");

module.exports = exports = async function (ctx, next) {
    const rid = ctx.role.i();
    const eventlist = global.gameconfig.chapter_new_event.EVENT_LIST.map(task => {
        return {
            index: task.ID,
            status: -1, // -1标示未触发
            exchange: {},
            taskscore: {},
            liang: {},
            subindex: 0,
            totaldamge: 0
        }
    })
    const touchlist = await ctx.dao.timeplay.find({rid });
    const touchMap = {};
    for (const t of touchlist) {
        t.status = 0;
        touchMap[t.index] = t;
    }
    for (let i = 0; i < eventlist.length; i++) {
        eventlist[i] = touchMap[eventlist[i].index] || eventlist[i];
    }
    ctx.body = {};
    ctx.body.eventlist = [];
    let lastUndoneCount = -1;
    const _now_ = Date.now();
    const get_process = async (task, item) => {
        if (task.task[item.ID]) {
            return item.REQUIRE_TIMES;
        }
        const prc = await task.taskProcess(item.ID, ctx.role);
        return prc;
    }
    let passCount = 0;
    for (let i = eventlist.length - 1; i >= 0; i--) {
        const one = eventlist[i];
        let undoneCount = 0; // 没有执行的玩法项标记
        one.task = one.task || {};
        let taskConfig = global.gameconfig.chapter_new_event.TASK[one.index];
        let task;
        if (taskConfig) {
            task = [];
            const etime = (one.task_time && one.task_time.etime ) || 0;
            for (let t of taskConfig) {
                // 查询活动时间内发生任务事件
                const doneCount = one.status === 0 ? await get_process(one, t) : 0;
                if (etime > _now_ &&!one.task[t.ID] ) { // 有未完成的 标记++, 且活动未结束
                    undoneCount++;
                }
                task.push({
                    id: t.ID,
                    process: doneCount,
                    require: t.REQUIRE_TIMES,
                    status: one.task[t.ID] || 0,
                    items: t.REWARDS
                });
            }
        }

        let exchange;

        const exchangeConfig = global.gameconfig.chapter_new_event.EXCHANGE[one.index];
        if (exchangeConfig) { // 有限时兑换
            exchange = [];
            const etime = (one.exchange_time && one.exchange_time.etime ) || 0;
            for (const c of exchangeConfig) {
                if (etime > _now_ && !one.exchange[c.ID] ) {
                    undoneCount++;
                }
                exchange.push({
                    id: c.ID,
                    times: one.exchange[c.ID] || 0,
                    limit: c.LIMIT,
                    from: c.FROM,
                    to: c.TO,
                });
            }
        }
        let taskscore;

        const t_score = global.gameconfig.chapter_new_event.TASK_SCORE[one.index];
        if (t_score) {
            taskscore = [];
            const etime = (one.task_time && one.task_time.etime ) || 0;
            for (const t of t_score) {
                if (etime > _now_ && !one.taskscore[t.ID]) {
                    undoneCount++;
                }
                taskscore.push({
                    id: t.ID,
                    num: t.NUM,
                    items: t.REWARDS,
                    status: one.taskscore[t.ID] || 0,
                    process: Object.values(one.task).length
                })
            }
        }
        let liang;
        const lcfg = global.gameconfig.chapter_new_event.LIANG[one.index];
        if (lcfg) {
            liang = [];
            const startDate = new Date(one.create);
            startDate.setHours(0, 0, 0, 0);

            for (const l of lcfg) {
                if (!one.liang[l.ID]) {
                    undoneCount++;
                }
                const tmp = {
                    id: l.ID,
                    items: l.REWARDS,
                    status: one.liang[l.ID] || 0,
                    etime: startDate.getTime() + (l.DAY - 1) * 24 * 3600 * 1000
                };
                liang.push(tmp);
                if (tmp.etime < Date.now()) {
                    const etime = global.gameconfig.chapter_new_event.LIANG_DEF_TIME + one.create;
                    if (etime > Date.now()) {
                        tmp.etime = etime;
                    }
                }

            }
        }

        const bid = global.gameconfig.chapter_new_event.BOSS[one.index];
        const boss = global.gameconfig.boss_time_limit[bid];
        let bossset;
        if (bid) {
            const bosssetCfg = global.gameconfig[`battlelmboss`];
            bossset = boss.map(b => ({bset: bosssetCfg[b.ID], gsid: b.GENERAL}));

            const lastBossIndex = boss.length - 1;
            if (one.subindex < lastBossIndex) {
                undoneCount++;
            } else if (one.subindex === lastBossIndex && one.totaldamge < boss[lastBossIndex].BOSSHP) {
                undoneCount++;
            }
        }
        if (one.status !== -1) {
            lastUndoneCount = 0;
        }
        let confireUndoneCount = one.status === -1 ? lastUndoneCount : undoneCount // 如果没有可完成数，不返回该事件
        if(confireUndoneCount == 0) {
            passCount++;
        }
        ctx.body.eventlist.push({
            boss: bid && {
                bossid: bid,
                subindex: one.subindex,
                last: one.last,
                lastdamge: one.lastdamge,
                totaldamge: one.totaldamge,
                totalHp: boss[one.subindex] && boss[one.subindex].BOSSHP,
                bossindex: boss[boss.length - 1].BOSSHP > 1 ?
                    (boss.length - 1) : -1
            },
            bossset,
            task,
            exchange,
            taskscore,
            task_time: one.task_time,
            exchange_time: one.exchange_time,
            liang,
            index: one.index,
            create: one.create,
            etime: one.etime,
            undoneCount: confireUndoneCount
        });

    }
    // 新七日目标，限时战役通关个数
	hitHere(ctx.role, 98700, passCount);
};
