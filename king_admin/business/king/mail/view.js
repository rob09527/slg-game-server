exports.name = '邮件管理';
exports.type = 'N';
exports.view = true;
exports.exec = async function (body, query, ctx) {
    const servers = await this.service.game.serversOptions(ctx.adminRole);
    const columns = [
        {
            title: '服务ID',
            dataIndex: 'servid'
        },
        {
            title: '角色名',
            dataIndex: 'role.rname'
        },
        {
            title: 'UID',
            dataIndex: 'role.uid',
            type: 'Link',
            props: {
                _: {
                    _tooltip: `this.props.rowData.rid`,
                    to: '`king-role-view#search=${this.props.rowData.rid}`',
                }
            }
        },
        {
            title: '短号',
            dataIndex: 'role.rno'
        },
        {
            title: '时间',
            type: 'text-date',
            dataIndex: 'create'
        },
        {
            title: '来自',
            dataIndex: 'from_str',
            type: 'Link',
            props: {
                _: {
                    disabled: '!this.props.rowData.from.fid',
                    _tooltip: `this.props.rowData.from.fid`,
                    to: '`king-role-view#search=${this.props.rowData.from.fid}`',
                }
            }
        },
        {
            title: '邮件标题',
            dataIndex: 'title'
        },
        {
            title: '状态',
            dataIndex: 'statusStr',
            type: 'html'
        },
        {
            title: '奖励',
            dataIndex: 'rewardStr',
            width: '25%'
        },
        {
            title: '内容',
            dataIndex: 'content',
            width: '40%'
        },
        {
            title: '备注',
            dataIndex: 'comment',
            width: '40%'
        },
        {
            title: '删除',
            type: 'AkButton',
            dataIndex: 'action',
            props: {
                type: 'danger',
                icon: 'delete',
                confirm: '确定删除吗?',
                // modal 弹框, action 单纯提交
                action: `king-mail-del`,
            }
        }
    ];

    const filter = [
        {
            key: 'servid',
            name: '服务器',
            type: 'select',
            showSearch: true,
            style: {minWidth: 150},
            options: ['ALL', ...servers]
        },
        {
            key: "uid",
            name: "角色UID|RNO"
        },
        {
            key: 'create',
            type: 'date',
            name: '创建日期',
            pickerType: 'RangePicker'
        },
        {
            key: 'title',
            name: '标题'
        },
        {
            type: 'select',
            key: 'from',
            name: '来自',
            options: [
                'ALL',
                {
                    name: '系统',
                    value: 'sys'
                },
                {
                    name: '军团',
                    value: 'legion'
                },
                {
                    name: '好友',
                    value: 'role'
                }
            ]
        }
    ];


    const buttons = [
        {
            children: '删除指定条件邮件',
            type: 'danger',
            confirm: "确定删除当前条件的所有邮件么?",
            action: 'king-mail-server-del'
        }
    ]


    return [{
        _type: 'AkTable',
        rowKey: '_id',
        limit: 10,
        filter,
        columns,
        buttons,
        download: true,
        action: 'king-mail-find'
    }]
};

