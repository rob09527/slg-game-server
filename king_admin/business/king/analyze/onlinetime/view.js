exports.name = '在线时长';
exports.type = 'N';

exports.exec = async function (body, query, ctx) {
    const servers = await this.service.game.serversOptions(ctx.adminRole);


    const filter = [
        {
            key: 'servid',
            name: '服务器',
            type: 'select',
            showSearch: true,
            style: {minWidth: 180},
            options: ['ALL' ,...servers]
        }
        // {
        //     key: 'date',
        //     type: 'date',
        //     name: '注册日',
        //     pickerType: 'RangePicker'
        // }
    ];


    const columns = [
        {
            title: '服务ID',
            dataIndex: 'servid'
        },
        {
            title: '平均在线时长',
            dataIndex: 'avg_time',
        },
    ].filter(Boolean);
    //


    const handleData = (data) => {
        let {items, total, time} = data;
        const maxCol = {}; // 保证 20列，不然前端效果异常
        items = items.map(item => {
            const {data, ...obj} = item;
            const mChild = {};
            obj.children = [mChild];
            for (const datum of item.data) {
                maxCol[datum.key] = maxCol[datum.key] || {
                    title: datum.key,
                    dataIndex: datum.key,
                    width: 80
                }
                if (datum.value) {
                    obj[datum.key] = Math.round(datum.value / 1000 / 60) + 'm';
                }
                mChild[datum.key] = datum.count;
            }
            return obj;
        })


        const expendColumns = [];

        for (const k of Object.keys(maxCol).sort()) {
            expendColumns.push(maxCol[k]);
        }

        return {expendColumns, items, total, time};
    }

    return {
        _type: 'AkTable',
        buttons: [].filter(Boolean),
        title: '在线时长统计',
        filter,
        filter_history: true,
        size: 'small',
        ayzKey: query.id,
        limit: 15,
        download: true,
        columns,
        action: `king-analyze-onlinetime-list`,
        handleData: body._export_ && handleData,
        _: {
            handleData: handleData.toString()
        }
    }
};

