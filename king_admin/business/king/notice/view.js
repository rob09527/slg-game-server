exports.name = '公告管理';
exports.view = true;
exports.type = 'N';
exports.exec = async function (body, query, ctx) {

    const bundleModel = await this.db.mongo.bundle;
    const bundles = await bundleModel.getBundles(ctx.adminRole);

    const mModel = await this.service.game.collection('maintains');
    const maintain = await mModel.findOne({type:0});
    const openserver = await mModel.findOne({type:1});
    const servers = await this.service.game.serversOptions(ctx.adminRole);
    const createForm = (name, action, s) => ({
        children: name,
        type: 'primary',
        _type: 'AkButton',
        modal: {
            width: '60%',
            children: {
                ...(s ? {
                    _type: 'KhServersForm',
                    servers: servers,
                    batch_push: true,
                } : {
                    _type: 'AkForm',
                }),
                action: action,
                form: [
                    {
                        name: '公告名字',
                        key: 'title',
                        require: true,
                        maxLength: 50
                    },
                    {
                        name: '公告分类',
                        key: 'type',
                        placeholder: 'default'
                    },
                    {
                        key: 'bundle',
                        name: '生效包名',
                        style: {minWidth: 230},
                        type: 'select',
                        require: true,
                        options: [
                            'ALL',
                            ...bundles
                        ],
                        mode: "multiple",
                    }
                ]
            }
        }
    });
    const columns = [
        {
            title: '公告标题',
            dataIndex: 'title',
            _to: 'king-notice-editor?id=${_id}',
        },
        {
            title: '公告分类',
            dataIndex: 'type',
        },
        {
            title: '定向服',
            dataIndex: 'sid',
            type: 'div',
            props: {
                _: {
                    _tooltip: 'this.props.rowData.servers'
                }
            }
        },
        {
            title: '公告包名',
            dataIndex: 'bundle_str',
            width: '40%'
        },

        {
            title: '状态',
            dataIndex: 'status',
            type: 'AkInput',
            action: 'king-notice-update',
            props: {
                type: 'switch',
                _: {
                    confirm: 'this.props.rowData.status?"确认取消展示么?":"确认发布展示该公告么?"',
                }
            }
        },
        {
            title: '操作',
            dataIndex: 'action',
            type: 'components',
            components: [
                {
                    ...createForm('编辑', 'king-notice-update'),
                    _: {
                        style: 'this.props.rowData.servid?{display:"none"}:{}'
                    }
                },
                {
                    ...createForm('编辑', 'king-notice-update', 1),
                    _: {
                        style: 'this.props.rowData.servid?{}:{display:"none"}'
                    }
                },
                {
                    _type: 'AkButton',
                    children: '删除',
                    type: 'danger',
                    action: 'king-notice-update?status=3',
                    confirm: `确认删除该公告展示么?删除无法找回!`
                }
            ]

        }
    ];


    const buttons = [
        createForm('添加公告', 'king-notice-create'),
        createForm('添加定服公告', 'king-notice-create', 1),
        {
            children: '设置维护公告',
            type: 'primary',
            _type: 'AkButton',
            modal: {
                width: '60%',
                children: {
                    _type: 'AkForm',
                    action: 'king-notice-maintain',
                    data: {
                        etime: maintain && new Date(maintain.etime).format(),
                        content: maintain && maintain.content
                    },
                    form: [
                        {
                            name: '维护内容',
                            key: 'content',
                            require: true,
                            type: "textarea"
                        },
                        {
                            name: '结束时间',
                            key: 'etime',
                            type: 'date',
                            require: true,
                            showTime: true
                        }
                    ]
                }
            }
        },
        {
            children: '设置开服公告',
            type: 'primary',
            _type: 'AkButton',
            modal: {
                width: '60%',
                children: {
                    _type: 'AkForm',
                    action: 'king-notice-openserver',
                    data: {
                        content: openserver && openserver.content
                    },
                    form: [
                        {
                            name: '内容',
                            key: 'content',
                            require: true,
                            type: "textarea"
                        },
                    ]
                }
            }
        }
    ];

    const noticeModel = await this.service.game.collection('notices');
    if (!global.NORICE_TYPS) {
        const typeList = await noticeModel.aggregate([
            {
                $group: {
                    _id: '$type'
                }
            }
        ]).toArray();
        global.NORICE_TYPS = typeList.map(t => t._id);
    }


    const filter = [
        {
            key: 'bundle',
            name: '生效包名',
            style: {minWidth: 230},
            type: 'select',
            options: ['ALL', ...bundles],
            // mode: "multiple",
        },
        {
            key: 'type',
            name: '公告类型',
            style: {minWidth: 150},
            type: 'select',
            options: ['ALL', ...global.NORICE_TYPS],
            // mode: "multiple",
        }
    ];

    return [
        {

            _type: 'AkTable',
            rowKey: '_id',
            filter,
            buttons,
            columns,
            action: 'king-notice-list'
        }
    ]
};

