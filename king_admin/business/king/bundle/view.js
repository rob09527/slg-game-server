exports.name = '包名管理';
exports.view = true;
exports.type = 'N';
exports.exec = async function (body, query, ctx) {
    const createBtn = {
        children: '添加包名',
        type: 'primary',
        modal: {
            width: '60%',
            children: {
                _type: 'AkForm',
                action: 'king-bundle-create',
                form: [
                    {
                        name: '包名',
                        key: 'bundle',
                        require: true,
                        maxLength: 80
                    },
                    {
                        name: '所属渠道',
                        key: 'channel',
                        require: true,
                        maxLength: 30
                    },
                    {
                        name: '统计分组',
                        key: 'group',
                        require: true,
                        maxLength: 30
                    },
                    {
                        name: 'GAMEID',
                        key: 'gameid',
                        maxLength: 80,
                        placeholder: '格式 channel_gameid'
                    }
                ]
            }
        }
    };

    const columns = [
        {
            title: '包名',
            dataIndex: 'bundle'
        },
        {
            title: '所属渠道',
            dataIndex: 'channel',
        },
        {
            title: '统计分组',
            dataIndex: 'group',
        },
        {
            title: 'GAME_ID',
            dataIndex: 'gameid'
        },
        {
            title: '操作',
            dataIndex: 'action',
            type: 'components',
            components: [
                {
                    _type: 'AkButton',
                    ...createBtn,
                    children: '编辑',

                },
                {
                    _type: 'AkButton',
                    children: '删除',
                    type: 'danger',
                    action: 'king-bundle-create?del=1',
                    confirm: `确认删除该包名么?`
                }
            ]

        }
    ];


    const filter = [
        {
            key: 'channel',
            name: '所属渠道',
            style: {minWidth: 150},
        }
    ];
    let channelList = await this.db.mongo.bundle.getChannel(ctx.adminRole);
    channelList = channelList.map(elem => elem.value);
    const buttons = [
        createBtn,
        {
            type: 'primary',
            children: '跳转链接',
            modal: {
                title: "跳转链接设定",
                width: "60%",
                children: {
                    _type: "AkForm",
                    data: {
                        channels: [],
                        isshow: 'false',
                        url: ''
                    },
                    form: [
                        {name: '选择渠道', require: true, type: "select", style: {minWidth: 180}, key: 'channels', mode: "multiple", options: ['ALL',...channelList], placeholder: '多个使用英文","分割'},
                        {name: '是否显示', require: true, type: "select", style: {minWidth: 180}, key: 'isshow', options: ['true', 'false']},
                        {name: '链接地址', require: true, type: "textarea", style: {minWidth: 180}, key: 'url', placeholder: '格式 http://'},
                    ],
                    action: 'king-bundle-skiplink'
                }
            },
        }
    ];

    return [
        {
            _type: 'AkTable',
            rowKey: '_id',
            filter,
            buttons,
            columns,
            action: 'king-bundle-list'
        }
    ]
};

