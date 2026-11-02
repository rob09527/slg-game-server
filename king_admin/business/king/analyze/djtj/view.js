exports.name = '点将统计';
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
            options: ['ALL', ...servers]
        },

        {
            key: 'date',
            type: 'date',
            name: '操作日期',
            _tooltip: '默认查最近30天',
            pickerType: 'RangePicker'
        }
    ];

    const columns = [
        {
            title: '日期',
            dataIndex: 'date',
        },
        {
            title: '魏国单抽角色数',
            dataIndex: 'wei_1_rolecount',
        },
        {
            title: '魏国单抽次数',
            dataIndex: 'wei_1_count',
        },
        {
            title: '魏国10连角色数',
            dataIndex: 'wei_10_rolecount',
        },
        {
            title: '魏国10连次数',
            dataIndex: 'wei_10_count',
        },
        {
            title: '蜀国单抽角色数',
            dataIndex: 'shu_1_rolecount',
        },
        {
            title: '蜀国单抽次数',
            dataIndex: 'shu_1_count',
        },
        {
            title: '蜀国10连角色数',
            dataIndex: 'shu_10_rolecount',
        },
        {
            title: '蜀国10连次数',
            dataIndex: 'shu_10_count',
        },
        {
            title: '吴国单抽角色数',
            dataIndex: 'wu_1_rolecount',
        },
        {
            title: '吴国单抽次数',
            dataIndex: 'wu_1_count',
        },
        {
            title: '吴国10连角色数',
            dataIndex: 'wu_10_rolecount',
        },
        {
            title: '吴国10连次数',
            dataIndex: 'wu_10_count',
        },
        {
            title: '群雄单抽角色数',
            dataIndex: 'qx_1_rolecount',
        },
        {
            title: '群雄单抽次数',
            dataIndex: 'qx_1_count',
        },
        {
            title: '群雄10连角色数',
            dataIndex: 'qx_10_rolecount',
        },
        {
            title: '群雄10连次数',
            dataIndex: 'qx_10_count',
        },
        {
            title: '帝魔国单抽角色数',
            dataIndex: 'dm_1_rolecount',
        },
        {
            title: '帝魔国单抽次数',
            dataIndex: 'dm_1_count',
        },
        {
            title: '帝魔国10连角色数',
            dataIndex: 'dm_10_rolecount',
        },
        {
            title: '帝魔国10连次数',
            dataIndex: 'dm_10_count',
        }
    ];
    //

    return [{
        _type: 'AkTable',
        filter,
        filter_history: true,
        size: 'small',
        limit: 15,
        download: true,
        columns,
        action: 'king-analyze-djtj-list?event_type=EVENT_DJ'
    }]
};

