module.exports = exports = function () {
    let act = global.ACTIVITY['ftmphb']
    //format
    //toISOString
    const datekey_end = (new Date(act.etime)).format().slice(0, 10);
    let globalkey = `ftmphb-global-${datekey_end}`
    // new Date().format()
    const now = new Date(); // 当前日期和时间
    const dateKey = (now).format().slice(0, 10);
    let dailykey = `ftmphb-${dateKey}`

    now.setDate(now.getDate() - 1);
    const datejiesuanKey = (now).format().slice(0, 10);
    let dailyjs = `ftmphb-${datejiesuanKey}`

    let ftmphb = {
        globalkey,
        dailykey,
        datekey_end: datekey_end,
        date_today: dateKey,
        dailykey_db: dateKey,
        globalkey_db: `${datekey_end}-end`,
        dailyjs: dailyjs
    }

    return {
        ftmphb
    }
}

