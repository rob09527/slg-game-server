'use strict'

const MAIL_EVENTS = [
    // 打开周活动邮件
    'DAILYMAIL', 'JRHDDM', 'GJLBDM', 'GZLBDM', 'GXLBDM'
]

exports.name = "周活动邮件";

const zhdmail = require('./../util/zhdmail_fn');

/**
 * 子定时任务列表
 * @return {Promise<[{main: function, cron: array|string,ID: string,name: string, force_on_time?: boolean}]>}
 */
exports.children = async function () {

    let tasks = [];
    let sec_interval = 40;
    for (let event of MAIL_EVENTS) {
        let config = global.config.ZHD[event];
        if (!config) continue;
        let items = global.gameconfig.zhd[event];
        if (!items) continue;
        items = items.ITEMS;
        let [start, end] = config;
        const obj = { // 任务对象
			ID: event,
			name: event,
			cron: null
		}
		// start mail
		obj.main = async () => {
			if (!Date.in(start, end)) return;
			let items = global.gameconfig.zhd[event].ITEMS;
			await zhdmail(event, items)
		}

        if (Date.now() > end) {
			tasks.push(obj); // 添加一个没有cron的任务，这样可以在任务列表看到该子任务,方便管理系统维护
        	continue;
		}

        // daily mail
        tasks.push({
        	...obj,
            cron: [
				new Date(start),
				`${sec_interval} 0 0 * * *`
			]
        });
    }
    return tasks;

}
