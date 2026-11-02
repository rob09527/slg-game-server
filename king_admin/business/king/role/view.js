exports.name = '玩家查询';
exports.view = true;
exports.type = 'N';
exports.exec = async function (body, query, ctx) {
    const servers = await this.service.game.serversOptions(ctx.adminRole);
    const mailForm = util.getMailForm();
    const columns = [
        {
            title: '服务器',
            dataIndex: 'servid'
        },
        {
            title: 'RNO',
            dataIndex: 'rno',
            type: 'div',
            props: {
                _: {
                    children: `this.props.rowData.rno`,
                    _tooltip: `this.props.rowData._id`
                }
            }
        },
        {
            title: 'UID',
            dataIndex: 'uid',
            show: false,
        },
        {
            title: '昵称',
            dataIndex: 'rname',
            type: 'div',
            props: {
                _: {
                    _tooltip: `this.props.rowData.uid`
                }
            }
        },
        {
            title: '渠道',
            dataIndex: 'channel'
        },
        {
            title: '设备',
            dataIndex: 'platform'
        },
        {
            title: '机型',
            dataIndex: 'phonetype'
        },
        {
            title: '包名',
            dataIndex: 'bundle'
        },
        {
            title: '等级',
            dataIndex: 'level',
            type: 'div',
            sorter: true,
            props: {
                _: {
                    children: `this.props.rowData.level`,
                    _tooltip: `'总经验:' + this.props.rowData._exp_`
                }
            }
        },
        {
            title: '关卡',
            dataIndex: 'maxmapid',
            sorter: true,
        },
        {
            title: 'VIP',
            dataIndex: 'vip',
            sorter: true,
            type: 'span',
            props: {
                _: {
                    _tooltip: `'VIP经验:' + this.props.rowData._vipexp_`
                }
            }
        },
        {
            title: '创建时间',
            dataIndex: 'create',
            type: 'text-date',
            sorter: true
        },
        {
            title: '近期活跃',
            dataIndex: 'update',
            type: 'text-date',
            sorter: true,
        },
        {
            title: '详情',
            dataIndex: 'action0',
            type: 'components',
            components: [
                {
                    _type: 'AkButton',
                    children: '详情',
                    modal: `king-role-detail`,
                },
                ctx.actionSet.has(`king-role-playinfo`) ?
                    {
                        _type: 'AkButton',
                        children: ctx.i18n('任务'),
                        modal: `king-role-playinfo`,
                    } : null,
                ctx.actionSet.has(`king-mail-send`) ? {
                    _type: 'AkButton',
                    children: '发邮件',
                    modal: {
                        maskClosable: false,
                        width: '65%',
                        children: {
                            _type: "AkForm",
                            form: [
                                {name: '服务器', key: 'servid', disabled: true},
                                {name: '角色', key: 'rids', disabled: true},
                                ...mailForm
                            ],
                            action: `king-mail-send`
                        }
                    }
                } : null,
                {
                    _type: 'AkButton',
                    children: '操作',
                    modal: `king-role-dobtns`,
                }
            ].filter(Boolean)
        },
        {
            title: '数据',
            dataIndex: 'action1',
            type: 'components',
            components: [
                {
                    _type: 'Link',
                    key: '1',
                    _: {
                        to: '`king-log-prop-view#serverid=${this.props.rowData.servid}&uid=${this.props.rowData.uid}`',
                    },
                    style: {padding: '2px 4px'},
                    children: '道具日志'
                },
                // {
                //     _type: 'Link',
                //     key: '2',
                //     style: {padding: '2px 4px'},
                //     _: {
                //         to: '`king-log-api-view#serverid=${this.props.rowData.servid}&uid=${this.props.rowData.uid}`',
                //     },
                //     children: '活跃日志'
                // },
                {
                    _type: 'Link',
                    key: '3',
                    _: {
                        to: '`king-gifts-view?serverid=${this.props.rowData.servid}&rid=${this.props.rowData._id}`',
                    },
                    style: {padding: '2px 4px'},
                    children: '推荐礼包'
                },
                ctx.actionSet.has(`king-mail-view`) ? {
                    _type: 'Link',
                    key: '4',
                    _: {
                        to: '`king-mail-view#servid=${this.props.rowData.servid}&uid=${this.props.rowData.uid}`',
                    },
                    children: '邮件查询'
                } : null
            ].filter(Boolean)
        }
    ];

    const bundles = await this.db.mongo.bundle.getBundles(ctx.adminRole);

    if (body._export_) {
        columns.splice(-2, 2);// 导出时不需要的列
        columns.splice(7, 0, {
            title: 'VIP经验',
            dataIndex: '_vipexp_'
        })
        columns.splice(1, 0, {
            title: 'uid',
            dataIndex: 'uid'
        })
    }
    const filter = [
        {
            key: 'serverid',
            name: '服务器',
            type: 'select',
            showSearch: true,
            style: {minWidth: 150},
            options: ['ALL', ...servers]
        },
        {
            key: 'search',
            placeholder: 'rno,rname搜索',
            name: '角色搜索',
        },
        {
            key: 'bundle',
            name: '包名',
            type: 'select',
            mode: "multiple",
            style: {minWidth: 230},
            _tooltip: '可以长按选项试试效果',
            options: bundles
        },
        {
            key: 'platform',
            name: "设备",
            type: 'select',
            mode: "multiple",
            options: [
                'android',
                'ios',
                'h5',
                'wechatgame'
            ]
        },
        {
            key: 'create',
            type: 'date',
            name: '创建日期',
            pickerType: 'RangePicker',
            showTime: true
        },
        {
            key: 'activeDate',
            type: 'date',
            name: '指定活跃日期',
            pickerType: 'RangePicker',
            showTime: true
        },
        {
            key: 'expand',
            name: '拓展标记',
            placeholder: '拓展查询GSID,例:38005,38006'
        }
    ];

    const buttons = []
    const sendallmail = `king-mail-sendall`;
    if (ctx.actionSet.has(sendallmail)) {

        buttons.push({
            children: '发送全服邮件',
            type: 'primary',
            modal: {
                maskClosable: false,
                width: '80%',
                children: {
                    _type: 'KhServersForm',
                    confirm: '确认发送?',
                    servers: servers,
                    form: mailForm,
                    action: sendallmail
                }
            }
        })
    }

    // 拥有发送礼包的权限，展示审核列表
    if (ctx.actionSet.has(`king-role-spp-send`)) {
        const applyTotal = await this.db.mongo.log.countDocuments({
            action: `king-role-spp-apply`,
            'body.confirm': {$exists: false}, // 未审核的列表
        });
        buttons.push({
            children: '模拟充值审核(' + applyTotal + ')',
            type: 'primary',
            modal: {
                maskClosable: false,
                width: '80%',
                children: {
                    _type: 'AkTable',
                    action: `king-role-spp-applylist`,
                    limit: 8,
                    columns: [
                        {
                            title: '管理员',
                            dataIndex: 'adminName'
                        },
                        {
                            title: '礼包',
                            dataIndex: 'sppackName'
                        },
                        {
                            title: '用户名',
                            dataIndex: 'body.rname'
                        },
                        {
                            title: '用户短号',
                            dataIndex: 'body.rno'
                        },
                        {
                            title: 'IP',
                            dataIndex: 'ip'
                        },
                        {
                            title: '时间',
                            dataIndex: 'create_at',
                            type: 'text-date'
                        },
                        {
                            title: '操作',
                            dataIndex: 'action',
                            type: 'components',
                            components: [
                                {
                                    _type: 'AkButton',
                                    children: '同意',
                                    type: 'primary',
                                    confirm: '确认同意?',
                                    action: `king-role-spp-send?confirm=1`,
                                },
                                {
                                    _type: 'AkButton',
                                    children: '拒绝',
                                    type: 'danger',
                                    confirm: '确认拒绝?',
                                    action: `king-role-spp-send?confirm=2`,
                                }
                            ]
                        }
                    ]
                }
            }

        })
    }

    const mailsomeAction = `king-mail-mailsomefind`;
    if (ctx.actionSet.has(mailsomeAction)) {
        buttons.push({
            children: '发送多人邮件',
            type: 'primary',
            modal: {
                title: "名单需为Excel或CSV文件，表头需为sid,uid 不能有多余表头。发送前请务必用内部号验一遍！",
                width: "70%",
                children: {
                    _type: "AkForm",
                    cancelModal: false,
                    form: [
                        {name: '邮件标题', key: 'title', require: true,},
                        {name: '邮件正文', type: "textarea", key: 'content', require: true,},
                        {name: '邮件备注', type: "textarea", key: 'comment'},
                        {
                            name: '奖励名单',
                            key: 'items',
                            type: 'excel',
                            require: true,
                        },
                    ],
                    confirm: '确认送吗?',
                    action: mailsomeAction,
                }
            }
        })
    }

    return {
        _type: 'AkTable',
        rowKey: '_id',
        limit: 10,
        size: 'small',
        download: true,
        buttons,
        filter,
        columns,
        action: `king-role-find`
    }
};

