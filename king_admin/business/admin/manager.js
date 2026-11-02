exports.name = '管理员查看';
exports.view = true;
exports.type = 'N';
exports.exec = async function (body, query, ctx) {
    const group = await this.service.admin.groups();

    return [
        {
            _type: 'AkTable',
            rowKey: 'id',
            // _keySpan: true,
            limit: 12,
            size: 'small',
            id: 'adminTable',
            buttons: [
                {
                    children: '部门权限细化',
                    type: 'primary',
                    modal: 'admin-group-edit'
                },
                {
                    children: '创建管理员',
                    _i18n: 'children',
                    type: 'primary',
                    modal: {
                        children: {
                            _type: 'AkForm',
                            action: 'admin-create',
                            form: [
                                {
                                    name: ctx.i18n('姓名'),
                                    key: 'name',
                                    require: true,
                                    maxLength: 16
                                },
                                {
                                    key: 'email',
                                    name: ctx.i18n('邮箱'),
                                    maxLength: 64,
                                    require: `function(value){
                                   if(!value){ return {ok: false} }
                                   else if(!/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(value)){
                                       return {ok: false, message: '请输入正确的邮箱'}
                                   }
                                   else { return {ok: true} }
                               }`
                                },
                                {
                                    key: 'group',
                                    name: ctx.i18n('部门'),
                                    require: true,
                                    type: 'select',
                                    style: {minWidth: 180},
                                    options: [...group.map(g => ({
                                        name: g,
                                        value: g,
                                        disabled: g === 'SUPER_MANAGER'
                                    }))],
                                    _: {
                                        dropdownRender: this.business.createSelectDropdown({
                                            placeholder: ctx.i18n('ADD') + ctx.i18n('部门'),
                                            btn: ctx.i18n('ADD')
                                        })
                                    }
                                }
                            ]
                        }
                    }
                }
            ],
            filter: [
                {
                    key: 'name',
                    name: '姓名',
                },
                {
                    key: 'group',
                    name: '部门',
                    type: 'select',
                    style: {minWidth: 180},
                    options: ['ALL', ...group]
                }
            ],
            columns: [
                {
                    title: '姓名',
                    dataIndex: 'name',
                    key: 'name',
                    sorter: true,
                },
                {
                    title: '邮箱',
                    dataIndex: 'email',
                },
                {
                    title: '部门',
                    dataIndex: 'group',
                    type: 'html',
                },
                {
                    title: '创建时间',
                    dataIndex: 'create_at',
                    type: 'text-date',

                },
                {
                    title: '状态',
                    dataIndex: 'status',
                    type: 'AkInput',
                    action: 'admin-update',
                    props: {
                        type: 'switch',
                        _: {
                            disabled: `this.props.rowData.name === 'admin' || this.props.rowData.id == '${ctx.adminId}'`,
                            confirm: 'this.props.rowData.status?i18n("确认禁用管理员?"):i18n("确认恢复管理员?")',
                        }
                    }
                },
                {
                    title: '操作',
                    dataIndex: 'action',
                    type: 'AkButton',
                    props: {
                        children: '权限修改',
                        _i18n: "children",
                        modal: 'admin-authority-modal'
                    }
                }
            ],
            action: 'admin-list'
        }
    ]
};
