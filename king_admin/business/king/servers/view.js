exports.name = '服务器列表';
exports.view = true;
exports.type = 'N';
exports.exec = async function (body, query, ctx) {
    const servers = await this.service.game.serversOptions(ctx.adminRole);
    const columns = [
        {
            title: '服务器ID',
            dataIndex: 'servid',
            sorter: true
        },
        {
            title: '服务器名',
            dataIndex: 'name'
        },
        {
            title: '服务器编号',
            dataIndex: 'sno'
        },
        {
            title: '合服组编号',
            dataIndex: 'groupid'
        },
        {
            title: '跨服聊天房间',
            dataIndex: 'room'
        },
        {
            title: '区服名称',
            dataIndex: 'area_name'
        },
        {
            title: '区服编号',
            dataIndex: 'area_id'
        },
        {
            title: '隔离配置',
            dataIndex: 'filter_str'
        },
        {
            title: '创角数',
            dataIndex: 'role_num'
        },
        {
            title: '付费数',
            dataIndex: 'pay_num'
        },               
        {
            title: '类型',
            dataIndex: 'type_str'
        },        
        {
            title: '开服时间',
            dataIndex: 'start',
        },
        {
            title: '爆满创角人数', 
            dataIndex: "auto_num"
        },
        {
            title: '爆满付费人数', 
            dataIndex: "auto_pay"
        },        
        {
            title: '爆满是否创角', 
            dataIndex: "auto_create_str"
        },
        {
            title: '服务器状态',
            dataIndex: 'status',
            action: 'king-servers-stop',
            type: 'AkInput',
            props: {
                type: 'switch',
                options: ['开服中', '停服中'],
                disabled: !ctx.actionSet.has('king-servers-stop'),
                _: {
                    confirm: 'this.props.rowData.status?i18n("确认停服么?停服过程会踢全体用户下线,随后禁止非白名单玩家登录!"):i18n("确认开服么? 随后所有玩家即可进入游戏!")',
                }
            }
        },
        {
            title: '操作',
            dataIndex: 'action',
            type: 'AkButton',
            props: {
                children: '修改',
                disabled: !ctx.actionSet.has('king-servers-update'),
                modal: 'king-servers-editmodal'
            }
        }
    ];
    const buttons = [];

    if (ctx.actionSet.has('king-servers-merge')) {
        buttons.push({
            _type: 'AkButton',
            children: '合服操作',
            type: 'danger',
            modal: {
                children: {
                    _type: 'KhServersForm',
                    servers: servers,
                    batch_push: true,
                    form: [],
                    action: 'king-servers-merge',
                    confirm: '您正在进行合服操作,请确认?'
                },

            }
        })
    }

    if (ctx.actionSet.has('king-servers-stop')) {
        buttons.push({
            _type: 'AkButton',
            children: '批量开停服',
            modal: {
                children: {
                    _type: 'KhServersForm',
                    servers: servers,
                    batch_push: true,
                    form: [
                        {
                            key: 'status',
                            name: '开停',
                            type: 'switch',
                            options: ['开服', '停服']
                        }
                    ],
                    action: 'king-servers-stop',
                    confirm: '请确认您的操作?'
                },

            }
        })
    }

    if (ctx.actionSet.has('king-servers-update')) {
        const bundleModel = await this.db.mongo.bundle;
        const packages = await bundleModel.find({gameid: {$exists: 1}});
        const serv_filters = [...new Set(packages.map(p => p.gameid).filter(Boolean))]; // 通过 gameid 来配置服务器过滤

        buttons.push({
            _type: 'AkButton',
            children: '批量修改隔离配置',
            modal: {
                children: {
                    _type: 'KhServersForm',
                    servers: servers,
                    batch_push: true,
                    form: [
                        {
                            key: 'filter',
                            name: '隔离设置',
                            type: 'select',
                            showSearch: true,
                            style: {minWidth: 180},
                            mode: "multiple",
                            options: ['all', ...serv_filters]
                        }
                    ],
                    action: 'king-servers-update_batch',
                    confirm: '请确认您的操作?'
                },
            }
        })
    }


    if (ctx.actionSet.has('king-servers-create')) {
        buttons.push({
            _type: 'AkButton',
            children: '开新服',
            modal: 'king-servers-editmodal?create=1'
        });
    }

    const preview = await this.remote.proxy_get_preview();

    buttons.push({
        _type: 'AkButton',
        children: '定向审核服',
        modal: {
            title: "定向审核服设定",
            width: "60%",
            children: {
                _type: "AkForm",
                data: {
                    appversion: preview.appversion ? preview.appversion.join(',') : '',
                    platform: preview.platform ? preview.platform : [],
                    bundle: preview.bundle ? preview.bundle.join(',') : ''
                },
                form: [
                    {name: 'appversion', type: "textarea", key: 'appversion', placeholder: '多个使用英文","分割'},
                    {name: 'platform', type: "select", key: 'platform', mode: "multiple", options: ['android', 'ios']},
                    {name: 'bundle', type: "textarea", key: 'bundle', placeholder: '多个使用英文","分割'},
                ],
                action: 'king-servers-preview'
            }
        },
    });

    const setting = await this.remote.proxy_get_global();

    if (ctx.actionSet.has('king-servers-auto_open')) {
        buttons.push({
            _type: 'AkButton',
            children: '自动开服',
            modal: {
                title: "自动开服设定",
                width: "60%",
                children: {
                    _type: "AkForm",
                    data: {
                        auto_open: setting.auto_open? setting.auto_open: 2,
                        auto_name: setting.auto_name? setting.auto_name: '服',
                        auto_num: setting.auto_num? setting.auto_num: 1000,
                        auto_pay: setting.auto_pay? setting.auto_pay: 100,
                        auto_create: setting.auto_create? setting.auto_create: 2
                    },
                    form: [
                        {name: '自动开服', type: "select", key: 'auto_open', options:[{name: '是', value: 1},{name: '否', value: 2}]},
                        {name: '服务器后缀名', type: "textarea", key: 'auto_name', placeholder: '自动开服时有效:数量+后缀名'},
                        {name: '爆满创角人数', type: "number", key: 'auto_num', min: 1, max: 3000, placeholder: '达到人数后自动开服,最大3000'},
                        {name: '爆满付费人数', type: "number", key: 'auto_pay', min: 1, max: 500, placeholder: '达到人数后自动开服,最大500'},
                        {name: '爆满是否创角', type: "select", key: 'auto_create', options:[{name: '能', value: 1},{name: '否', value: 2}]}
                    ],
                    action: 'king-servers-auto_open'
                }
            }
        })
    }

    if (ctx.actionSet.has('king-servers-opentime')) {
        buttons.push({
            _type: 'AkButton',
            children: '批量修改开服时间',
            modal: {
                title: "设置开服时间",
                width: "60%",
                children: {
                    _type: "AkForm",
                    form: [
                        {name: '开始服id', type: "number", key: 'start_serverid'},
                        {name: '结束服id', type: "number", key: 'end_serverid'},
                        {name: '开服时间', type: 'date',  key: 'start_time', showTime: true}
                    ],
                    action: 'king-servers-opentime'
                }
            }
        })
    }
    // if (global.config.game.is_h5 && ctx.actionSet.has('king-servers-version_review')) {
    //     const verReview = await this.remote.proxy_get_version_review();
    //     buttons.push({
    //         _type: 'AkButton',
    //         children: '版本审核期',
    //         modal: {
    //             title: "版本审核期设定",
    //             width: "60%",
    //             children: {
    //                 _type: "AkForm",
    //                 data: {
    //                     appversion: verReview.appversion ? verReview.appversion : '',
    //                     isreview: verReview.isreview ? verReview.isreview : 'false',
    //                 },
    //                 form: [
    //                     {name: 'appversion', type: "textarea", key: 'appversion', placeholder: ''},
    //                     {name: 'isreview', type: "select", key: 'isreview', options: ['true', 'false']}
    //                 ],
    //                 action: 'king-servers-version_review'
    //             }
    //         }
    //     });
    // }

    const gameids = await this.db.mongo.bundle.getGameIdList(ctx.adminRole);

    const filter = [
        {
            key: 'gameid',
            name: '隔离条件',
            type: 'select',
            style: {minWidth: 150},
            options: [
                'ALL',
                ...gameids
            ]
        }
    ];
    return [
        {
            _type: 'AkTable',
            rowKey: 'id',
            buttons,
            filter,
            data: setting,
            columns,
            action: 'king-servers-find?auto_num='+setting.auto_num+"&auto_pay="+setting.auto_pay+"&auto_create="+setting.auto_create
        }
    ]
};

