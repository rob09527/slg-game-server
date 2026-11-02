
const moment = require('moment');

/**
 * 
 * 查询到28天前那天0点00分到23点59分注册的账号，第21 14 7 天那几天注册的账号
 * 
 */
 module.exports = function() {
    let day = moment().add(-global.gameconfig.others.NEW_ROLE_DAYS, 'days');
    let cond = [];
    cond.push({
        create:{
            $gte:day.startOf('days').valueOf(),
            $lte:day.endOf('days').valueOf()
        }
    });
    const days = moment(moment().format('YYYY-MM-DD')).diff(day.format('YYYY-MM-DD'),'days');
    const diffWeekDays = Math.floor(days/7);
    for (let i = 1; i < diffWeekDays; i++) {
        day.add(7,'day');
        cond.push({
            create:{
                $gte:day.startOf('days').valueOf(),
                $lte:day.endOf('days').valueOf()
            }
        })
    }
    return cond;
}