exports.name = '在线详情';
exports.type = 'N';

exports.exec = async function (body, query, ctx) {
    const servers = await this.service.game.serversOptions(ctx.adminRole);
    const filter = [
        {
            key: 'servid',
            name: '服务器',
            type: 'select',
            showSearch: true,
            style: { minWidth: 180 },
            options: ['ALL', ...servers]
        },
        {
            key: 'date',
            type: 'date',
            name: '分析日期',
            pickerType: 'RangePicker'
        }
    ];
    // 去掉了所有的 单元格跳转 （ 因为两边过滤器不一致了，这不的channel 和 platform 是多个整合的
    const columns = [
        {
            title: '总人数',
            dataIndex: 'total',
        },
        {
            title: 'ios',
            dataIndex: 'ios',
        },
        {
            title: 'android',
            dataIndex: 'android'
        },
        {
            title: 'h5',
            dataIndex: 'h5'
        }, {
            title: '时间',
            dataIndex: 'time'
        },

    ];

    return {
        _type: 'AkTable',
        buttons: [],
        filter,
        download: true,
        size: 'small',
        limit: 24,
        columns,
        action: 'king-analyze-onlinereport-data'
    }

};

