exports.name = '军团列表';
exports.view = true;
exports.type = 'N';
exports.exec = async function (body, query, ctx) {

    const mailForm = util.getMailForm();
    const columns = [
        {
            title: '军团名',
            dataIndex: 'name',
        },
        {
            title: '军团等级',
            dataIndex: 'level',
            sorter: true
        },
        {
            title: '军团活跃',
            dataIndex: 'score'
        },
        {
            title: '成员数量',
            dataIndex: 'count',
        },
        {
            title: '军团长/其他成员',
            dataIndex: 'rname'
        },
        {
            title: '入团时间',
            dataIndex: 'jointime',
            type: 'text-date'
        },
        {
            title: '军团公告',
            dataIndex: 'notice',
            width: '25%'
        },
        {
            title: '创建时间',
            dataIndex: 'create',
            type: 'text-date'
        },
        {
            title: '操作',
            dataIndex: 'reportStr',
            type: 'components',
            components: [
                ctx.actionSet.has(`king-chat-view`) ? {
                    _type: 'Link',
                    key: '1',
                    _: {
                        to: '`king-chat-view#room=LEGION:legion_${this.props.rowData._id}`',
                        style: 'this.props.rowData.name?{padding: "2px 4px",marginRight: 12}:{display: "none"}'
                    },
                    children: '军团聊天'
                } : null,
                ctx.actionSet.has(`king-mail-send`) ?
                    {
                        _type: 'AkButton',
                        children: '发送军团邮件',
                        modal: `king-legion-info-mailmodal`,
                        _: {
                            style: 'this.props.rowData.name?{marginRight: 12}:{display: "none"}'
                        }
                    } : null,
                ctx.actionSet.has(`king-legion-info-edit`) ? {
                    _type: 'AkButton',
                    children: '编辑',
                    modal: 'king-legion-info-editmodal',
                    _: {
                        style: 'this.props.rowData.name?{marginRight: 12}:{display: "none"}'
                    }
                } : null,
                ...this.business["king-role-rolebtns"]({
                    def_prop: {
                        _: {
                            style: 'this.props.rowData.name?{display: "none"}: {marginRight: 12}'
                        }
                    }
                }, query, ctx),
                ctx.actionSet.has(`king-mail-send`) ? {
                    _type: 'AkButton',
                    children: '发邮件',
                    modal: {
                        maskClosable: false,
                        width: '65%',
                        children: {
                            _type: "AkForm",
                            form: [
                                {name: '角色', key: 'rname', disabled: true},
                                ...mailForm
                            ],
                            action: `king-mail-send`
                        }
                    },
                    _: {
                        style: 'this.props.rowData.name?{display: "none"}: {marginRight: 12}'
                    }
                } : null,
            ].filter(Boolean)
        }
    ];

    const servers = await this.service.game.serversOptions(ctx.adminRole);

    const filter = [

        {
            key: 'servid',
            name: '服务器',
            type: 'select',
            showSearch: true,
            style: {minWidth: 180},
            options: servers
        },
        {
            key: 'lname',
            name: '军团名'
        },
    ];

    return [
        {

            _type: 'AkTable',
            rowKey: '_id',
            columns,
            limit: 10,
            filter,
            action: `king-legion-info-find`
        }
    ]
};
