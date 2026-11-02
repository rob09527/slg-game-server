const moment = require('moment');
const nodeXlsx = require("node-xlsx");
exports.name = '全渠道导出';
exports.type = 'I';
exports.inherit = 'analyze-ltvmenus';
const MAX_LIMIT = 500000;

exports.exec = async function (body, query, ctx) {
    // 需要改造
    const type = query.type ? +query.type : +body.type;
    const id = query.id;
    //const servid = type == 1 ? body.servid : null;
    //const channels = await this.db.mongo.channels.getChannel(ctx.adminRole);
    const servers = await this.service.game.serversOptions(ctx.adminRole);
    console.log('DEBUG,', body, query,servers)
    const cmp = await this.business["king-analyze-ltv-view"]({id, type, _export_: true}, {
        id,
        type,
        pay: body.pay || query.pay
    }, ctx);
    const columns = cmp.columns;
    const viewTitle = cmp.title;
    const makeSheet = (columns, data) => {
        const out = [];
        const header = [];
        out.push(header);
        const fn = function () {
            return cmp.handleData(data);
        }
        data = fn.call({props: cmp});
        columns = [...columns, ...data.expendColumns];
        for (const c of columns) {
            header.push(c.title);
        }
        for (const item of data.items) {
            const obj = [];
            out.push(obj);
            for (const c of columns) {
                obj.push(item[c.dataIndex]);
            }
        }
        return out;
    }

    const fetchData = async (servid) => {
        const res = await this.business['king-analyze-ltv-list']({
            _export_: true,
            id,
            type,
            //channel,
            servid,
            _page_: {current: 1, limit: MAX_LIMIT},
            _sort_: {}
        }, {
            id,
            type,
            pay: body.pay || query.pay
        }, ctx);
        return res;
    }
    let res = await fetchData();
    const sheetList = []
    const sheet1 = makeSheet(columns, res);
    sheetList.push({
        name: "数据汇总",
        data: sheet1
    });

    if(type == 1) {
        // 循环查询单个区服数据
        for (const s of servers) {
            let res = await fetchData(s.value);
            const sheet = makeSheet(columns, res);
            sheetList.push({
                name: s.value + '区服数据',
                data: sheet
            });
        }
    }

    const buffer = nodeXlsx.build(sheetList);
    ctx.set('Content-Disposition', `attachment;filename=${encodeURIComponent(viewTitle + "数据导出" + moment().format("MMDDHHmmss") + '.xlsx')}`);
    ctx.set('content-type', `*/*`);
    ctx.body = buffer;
};

