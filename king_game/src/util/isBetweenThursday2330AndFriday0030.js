module.exports = exports = function isBetweenThursday2330AndFriday0030() {
    const now = new Date();
    const todayDayOfWeek = now.getDay();
    // 创建一个表示当天日期的Date对象
    const today = new Date();
    let checkdate = new Date(today);
    if (todayDayOfWeek === 4) { // 星期四
        // 无需调整，已经是星期四的日期
        checkdate.setHours(23, 30, 0, 0);
        if (now > checkdate.getTime()) {
            return true
        }
    } else if (todayDayOfWeek === 5) { // 星期五
        checkdate.setHours(0, 30, 0, 0);
        if (now < checkdate.getTime()) {
            return true
        }
    }
    return false;

}


