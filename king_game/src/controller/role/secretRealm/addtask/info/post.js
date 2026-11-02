//当天时间key
function thesameday() {
    // 获取当前日期
    const currentDate = new Date();
    // 提取年、月、日
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以需要加1，并且确保是两位数
    const day = String(currentDate.getDate()).padStart(2, '0'); // 确保日期是两位数
    // 使用-符号组合成key
    const dateKey = `${year}-${month}-${day}`;
    return dateKey
}
module.exports = async (ctx) => {
    let timekey = `addnewtask:${thesameday()}:${ctx.role.rno}}`
    const lockTimeout = 60 * 60 * 24
    let info = await global.redis.get(timekey)
    if (!info) {
        info = {}
        let configId = -1;
        while (configId < global.gameconfig.dailyboss.length) {
            configId += 1
            let config = global.gameconfig.dailyboss.find(e => e.TASKID == configId)
            if (!config) {
                continue
            }
            //领取标记查数量
            const count = ctx.role.getProp(config.GETMARK);
            if (count >= config.MAXFNUM) {
                continue
            }
            //记录了当前任务的领取次数//不是进度次数
            info[config.TASKID] = count
            if (Object.keys(info).length == 1) {
                break;
            }
        }
        await global.redis.set(timekey, JSON.stringify(info), 'NX', 'PX', lockTimeout)
        ctx.body = { state: 0, task: info }
    } else {
        info = JSON.parse(info)
        let config = global.gameconfig.dailyboss.find(e => e.TASKID == Object.keys(info)[0])
        const count = ctx.role.getProp(config.GETMARK);
        let state = 0;
        if (count != info[Object.keys(info)[0]]) {
            state = 1
        }
        let data = {
            task: info,
            state
        }
        ctx.body = data
    }

};
