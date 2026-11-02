exports.name = '付费账号的留存历史数据版';
exports.type = 'I';
exports.inherit = 'analyze-ltv-view';

exports.exec = async function (body, query, ctx) {
    //const servers = await this.service.game.serversOptions(ctx.adminRole);
    const bundles = await this.db.mongo.bundle.getBundles(ctx.adminRole);
    const type = query.type ? +query.type : +body.type;
    const filter = [
        {
            key: 'bundle',
            name: '包名',
            type: 'select',
            mode: "multiple",
            style: {minWidth: 150},
            _tooltip: '可以长按选项试试效果',
            options: [...bundles]
        },
        {
            key: 'date',
            type: 'date',
            name: '指定日期',
            pickerType: 'RangePicker'
        }
    ];
    const columns = [
        {
            title: '日期',
            dataIndex: 'date',
            width: 180
        },
        {
            title: '注册人数',
            dataIndex: 'roleCount',
            sorter: true
        },
        {
            title: '付费人数',
            dataIndex: 'payCount',
            sorter: true
        }
    ].filter(Boolean);
  
    const handleData = (data) => {
        let {items, total} = data;

        let maxCol = 0;
        items = items.map(a => {
            const mChild = {}; // 折叠的活跃数据
            a.children = [mChild]; //
            a.ratioList.map(r => maxCol = Math.max(r.length, maxCol));
            let obj = {};
            // 汇总数据
            for (let i = 0; i < maxCol; i++) {
                let k = `day${i + 1}`;
                obj[k] = 0;
                mChild[k] = 0;
                for (const r of a.ratioList) {
                    obj[k] += (r[i] ? r[i].ratio || 0 : 0);
                    mChild[k] += (r[i] ? r[i].actTotal || 0 : 0);
                }
                const lenNum = (a.ratioList||[]).filter(e=>e).length || 1
                obj[k] = (obj[k] / lenNum).toFixed(2) + '%';
                mChild[k] = Math.ceil(mChild[k] / lenNum);
            }
            
            return {
                date: a._id.date,
                roleCount: a.roleCount,
                payCount: a.payCount,
                children: a.children,
                ...obj
            }
        });
        const expendColumns = [];
        for (let i = 1; i < maxCol; i++) {
            const key = 'day' + i;
            expendColumns.push({
                title: i === 1 ? '当日' : i === 2 ? '次日' : i + '日',
                dataIndex: key,
                width: 80,
            });
        }
        return {expendColumns, items, total};
    }
    return {
        _type: 'AkTable',
        filter,
        filter_history: true,
        size: 'small',
        limit: 15,
        bordered: true,
        download: {
            url: `download?action=king-analyze-ltv-historyview`,
            body: {
                type: '' + type,
            }
        },
        columns,
        action: `king-analyze-ltv-history?type=${type}`,
        handleData: body._export_ && handleData,
        _: {
            handleData: handleData.toString()
        }
    }
}