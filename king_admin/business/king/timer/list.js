exports.name = '定时器查询';
exports.type = 'I';
exports.inherit = 'timer-view';
exports.exec = async function (body, query, ctx) {

    const {_page_, _sort_} = body;

    const list = await this.remote.agent_schedules({});
    let runCount = 0;
    const paraseItem = (item) => {
        if (item.children) {
            const runc = item.children.filter(c => c.running);
            item.children = item.children.map(paraseItem);
            item.status = runc.length ? '运行中' : '未运行';
            if (runc.length) {
                runCount++;
            }
            return item;
        } else {
            if (item.running) {
                runCount++;
            }
            return {
                ...item,
                report: item.report === true ? '成功' : item.report === false ? '失败' : '',
                status: item.running ? '运行中' : '未运行'
            }
        }

    }
    const items = list.map(paraseItem);
    if (_sort_ && _sort_.field) {
        items.sort((a, b) => {
            if (_sort_.order < 0) {
                return b[_sort_.field] - a[_sort_.field]
            } else {
                return a[_sort_.field] - b[_sort_.field]
            }
        })
    }
    return {
        items,
        total: items.length,
        totalExpend: [{title: '当前正在执行定时器数', value: runCount}]
    }

}
