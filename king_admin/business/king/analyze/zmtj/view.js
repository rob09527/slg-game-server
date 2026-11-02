exports.name = '招募统计';
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
            title: '普通招募单抽角色数',
            dataIndex: 'normal_1_rolecount',
        },
        {
            title: '普通招募单抽次数',
            dataIndex: 'normal_1_count',
        },
        {
            title: '普通招募10连角色数',
            dataIndex: 'normal_10_rolecount',
        },
        {
            title: '普通招募10连次数',
            dataIndex: 'normal_10_count',
        },
        {
            title: '高级招募单抽角色数',
            dataIndex: 'premium_1_rolecount',
        },
        {
            title: '高级招募单抽次数',
            dataIndex: 'premium_1_count',
        },
        {
            title: '高级招募10连角色数',
            dataIndex: 'premium_10_rolecount',
        },
        {
            title: '高级招募10连次数',
            dataIndex: 'premium_10_count',
        },
        {
            title: '友情招募单抽角色数',
            dataIndex: 'friend_1_rolecount',
        },
        {
            title: '友情招募单抽次数',
            dataIndex: 'friend_1_count',
        },
        {
            title: '友情招募10连角色数',
            dataIndex: 'friend_10_rolecount',
        },
        {
            title: '友情招募10连次数',
            dataIndex: 'friend_10_count',
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
        action: 'king-analyze-djtj-list?event_type=EVENT_ZM'
    }]
};

