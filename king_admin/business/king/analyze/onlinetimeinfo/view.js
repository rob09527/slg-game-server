exports.name = '在线时长明细';
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
            options: [
                'ALL',
                ...servers
            ]
        },
        {
            key: 'date',
            type: 'date',
            name: '日期',
            pickerType: 'RangePicker'
        }
    ];


    const columns = [
        {
            title: '服务ID',
            dataIndex: 'servid'
        },
        {
            title: 'UID',
            dataIndex: 'uid',
        },
        {
            title: '昵称',
            dataIndex: 'rname',
        },
        {
            title: '等级',
            dataIndex: 'level',
        },
        {
            title: 'vip',
            dataIndex: 'vip',
        },
        {
            title: '在线时长',
            dataIndex: 'online_ms'
        },
        {
            title: '首次上线时间',
            dataIndex: 'create',
            type: 'text-date'
        }
    ];
    //

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
        action: `king-analyze-onlinetimeinfo-list`
    }
};

