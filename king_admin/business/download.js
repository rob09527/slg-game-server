exports.name = '下载统计';
exports.type = 'O';
const moment = require('moment');
const FORMAT = 'YYYY-MM-DD HH:mm:ss';
const nodeXlsx = require("node-xlsx");

/**
 * 获取  属性
 * @param item {string}
 * @param name {string }
 */
const getProp = function (item, name) {
    if (!name) return;

    let o = item;
    for (const key of name.split('.')) {
        o = o[key];
        if (!o) return o;
    }
    return o;
}

const MAX_LIMIT = 500000;
exports.exec = async function (body, query, ctx) {

    const {action} = query;

    if (businessMap[action] && businessMap[action].type !== 'O' && !ctx.actionSet.has(action)) { // 没有权限
        throw 'authority-error' // 没有权限
    }
    delete body.token;
    const cmp = await this.business[action](body, query, ctx);

    const cmpItem = Array.isArray(cmp) ? cmp.find(o => o._type === 'AkTable') : cmp;
    if (!cmpItem || cmpItem._type !== 'AkTable') {
        throw 'only table can export'
    } else if (!cmpItem.action) {
        throw 'table miss action'
    }
    const columns = cmpItem.columns;
    const timezone = cmpItem.timezone;

    for (let k in body) {
        if (body[k] && typeof body[k] === 'string') {
            if (body[k].startsWith('[') || body[k].startsWith('{')) {
                body[k] = JSON.parse(body[k]);
            }
        }
    }
    body._page_ = {current: 1, limit: MAX_LIMIT};
    body._sort_ = {};
    const a = cmpItem.action.split('?');
    if (a[1]) {
        query = {};
        a[1].split('&').forEach(o => {
            const [k, v] = o.split('=');
            query[k] = v;
        });
    }

    let data = await this.business[a[0]](body, query, ctx);
    if (cmpItem.handleData) {
        // 兼容前端对 data 的处理逻辑
        const fn = function () {
            return cmpItem.handleData(data);
        }
        data = fn.call({props: cmpItem});
    }
    const items = Array.isArray(data) ? data : data.items;
    const expendColumns = data.expendColumns;
    if (expendColumns) {
        columns.push(...expendColumns);
    }

    let header = Object.values(columns).map(col => col.title) ;
    const sheet1 = [header];

    for (const item of items) {
        const line = [];
        for (const col of columns) {
            const o = getProp(item, col.dataIndex);
            let out = o;
            if (o === undefined) {
                out = "";
            } else if (col.type === 'text-date') {
                if (timezone) {
                    out = moment(new Date(isNaN(o) ? o : +o)).utcOffset(timezone).format(FORMAT);

                } else {
                    out = moment(new Date(isNaN(o) ? o : +o)).format(FORMAT);
                }
            }

            line.push(out);
        }
        sheet1.push(line);

    }
    const sheetList = []


    sheetList.push({
        name: "sheet1",
        data: sheet1
    });

    const buffer = nodeXlsx.build(sheetList);

    ctx.set('Content-Disposition', `attachment;filename=${encodeURIComponent((cmpItem.title || businessMap[action].name) + '.xlsx')}`);
    ctx.set('content-type', `*/*`);
    ctx.body = buffer;
};

