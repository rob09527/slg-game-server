exports.name = '战区划分';
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
            mode: "multiple",
            options: [...servers]
        },
        {
            key: 'areamark',
            placeholder: '选择填写',
            name: '战区',
        },
    ];

    // 去掉了所有的 单元格跳转 （ 因为两边过滤器不一致了，这不的channel 和 platform 是多个整合的
    const columns = [
        {
            title: '服务器',
            dataIndex: 'servid'
        },
        {
            title: '战区ID',
            dataIndex: 'areamark'
        },
        {
            title: '创建时间',
            dataIndex: 'create',
            type: "text-date"
        },
        {
            title: '更新时间',
            dataIndex: 'update',
            type: "text-date"
        },
    ];
    const createForm = (name, action) => ({
        children: name,
        type: 'primary',
        _type: 'AkButton',
        modal: {
            width: '60%',
            children: {
                ...{
                    _type: 'KhServersForm',
                    servers: servers,
                    batch_push: true,
                } ,
                action: action,
                form: [
                    {
                        name: '战区ID',
                        key: 'areamark',
                        require: true,
                        maxLength: 50
                    },
                ]
            }
        }
    });
    const buttons = [
        createForm('创建','dev-topkingpvp-warzone-create'),
        createForm('修改','dev-topkingpvp-warzone-edit'),
    ]
    return {
            _type: 'AkTable',
            buttons: [],
            filter,
            size: 'small',
            limit: 15,
            columns,
            buttons,
            action: 'dev-topkingpvp-warzone-list'
        }
};

