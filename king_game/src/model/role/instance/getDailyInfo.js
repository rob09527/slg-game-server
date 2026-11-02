const textgetter = require("../../../util/textgetter");

//消消乐每日宝箱
const dataEncapsulation = function (ctx) {
    let configbox = JSON.parse(JSON.stringify(global.gameconfig.mjxxl.box));
    for (let v in configbox) {
        let e = configbox[v]
        let items = [{ GSID: e.reward_0, COUNT: e.count_0 }, { GSID: e.reward_1, COUNT: e.count_1 }, { GSID: e.reward_2, COUNT: e.count_2 }]
        delete e.reward_0
        delete e.reward_1
        delete e.reward_2
        delete e.count_0
        delete e.count_1
        delete e.count_2
        e["items"] = items
    }
    // const now = ctx.role.getItems(mark).count;
    return configbox
}
//消消乐每日任务
const dataEncapsulationTask = function (ctx) {
    let configtask = JSON.parse(JSON.stringify(global.gameconfig.mjxxl.task));
    for (let v in configtask) {
        configtask[v].task = configtask[v].intro
        configtask[v].reward_count_sys = ctx.role.getItems(v).count;
        configtask[v].user_count_sys = ctx.role.getItems(v).count;
    }
    return configtask
}
//任务同步
const synctasks = function (task, ctx) {
    for (let v in task) {
        usertask = task[v]
        usertask.user_count_sys = ctx.role.getItems(v).count;
        usertask.user_count = usertask.user_count_sys - usertask.reward_count_sys
        if (usertask.user_count >= usertask.count) {
            usertask.user_count = usertask.count
        }
    }
    return task
}

const emailBoxAward = function (mjxxl) {
    let items = []
    let chestRewards = mjxxl.chestRewards
    for (let v in chestRewards) {
        if (chestRewards[v].state == 0 && mjxxl.score >= chestRewards[v].inscore) {
            items.push(...chestRewards[v].items)
        }
    }
    return items
}



module.exports = exports = async function (ctx) {
    let label = new Date().toISOString().slice(0, 10)
    let keys = Object.keys(global.gameconfig.mjxxl.shop);
    let xxlInitData = {
        label: label,
        score: 0,
        frequency: 10,//初始化次数
        chestRewards: dataEncapsulation(),//奖励配置
        taskRewards: dataEncapsulationTask(ctx),
        sysLimit: global.gameconfig.mjxxl.shop[keys[keys.length - 1]].count,
        userLimit: 0,
    }
    let data = {}
    let emailitem = []
    if (ctx.gameCache?.mjxxl && ctx.gameCache?.mjxxl?.label == label) {
        data = ctx.gameCache.mjxxl
    }

    if (ctx.gameCache?.mjxxl && ctx.gameCache?.mjxxl?.label != label) {
        this.mjxxl = xxlInitData
        data = xxlInitData
    }

    if (!ctx.gameCache?.mjxxl && this.mjxxl?.label == label) {
        data = this.mjxxl
    }
    if (!ctx.gameCache?.mjxxl && this.mjxxl?.label != label && this.mjxxl) {
        emailitem = emailBoxAward(this.mjxxl)
        this.mjxxl = xxlInitData
        data = this.mjxxl
        if (emailitem.length > 0) {
            const mails = [];
            mails.push({
                rid: ctx.role.i(),
                type: 2,
                title: textgetter("ANONYMOUS_PREFIX"),	// 无法获得奖励邮件通知
                content: textgetter("MJXXLEMAIL",),
                reward: emailitem,
            });

            await global.dao.mail.insertMany(mails);
        }
    }

    if (!this.mjxxl) {
        this.mjxxl = xxlInitData
        data = this.mjxxl
    }
    synctasks(data.taskRewards, ctx)
    return data
}