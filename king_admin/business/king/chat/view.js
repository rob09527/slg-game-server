exports.name = '聊天查看';
exports.view = true;
exports.type = 'N';
exports.exec = async function (body, query, ctx) {

    const servers = await this.service.game.serversOptions(ctx.adminRole);

    const columns = [

        {
            title: '角色名',
            dataIndex: 'from.name',
            type: 'div',
            props: {
                _: {
                    _tooltip: `this.props.rowData.from && this.props.rowData.from.rid`
                }
            }
        },
        {
            title: '操作',
            dataIndex: 'action',
            type: 'components',
            components: this.business["king-role-rolebtns"](body, query, ctx)

        },
        {
            title: '所在服务器',
            dataIndex: 'from.sname'
        },
        {
            title: 'vip',
            dataIndex: 'from.vip'
        },

        {
            title: '房间',
            dataIndex: 'room'
        },
        {
            title: '时间',
            dataIndex: 'time',
            type: 'text-date'
        },
        {
            title: '内容',
            dataIndex: 'message'
        }
    ];

    const roomOptions = servers.map(s => ({
        name: `${s.name}:单服${s.groupid}`,
        value: `单服df${s.value}:serv_${s.groupid}`
    }));
    roomOptions.push(...servers.map(s => ({
        name: `${s.name}:跨服${s.room}`,
        value: `跨服kf${s.value}:cross_${s.room}`
    })));
    roomOptions.push(...servers.map(s => ({
        name: `${s.name}:军团${s.value}`,
        value: `军团jt${s.value}:legion_${s.value}`
    })));

    const filter = [
        {
            key: 'search',
            name: '角色短号或角色名搜索',
            style: {minWidth: 150},
        },
        {
            key: 'room',
            name: '房间',
            style: {minWidth: 230},
            type: 'select',
            showSearch: true,
            options: ['ALL', ...roomOptions]
        },
        {
            key: 'time',
            type: 'date',
            name: '时间',
            pickerType: 'RangePicker',
            showTime: true
        },
    ];
    const buttons = [];

    const setting = await this.remote.proxy_get_global();
    buttons.push({
        children: '过滤文字',
        type: 'primary',
        modal: {
            width: "70%",
            children: {
                _type: "AkForm",
                data: {
                    filter: setting.chat_filter
                },
                form: [
                    {name: '英文逗号分割字符串', type: "textarea", key: 'filter'},
                ],
                action: 'king-chat-filter'
            }
        },
    })

    return [
        {
            _type: 'AkTable',
            rowKey: '_id',
            limit: 10,
            filter,
            buttons,
            columns,
            action: 'king-chat-list'
        }
    ]
};

