exports.name = '部门权限细化弹框';
exports.type = 'I';
exports.inherit = 'create';
exports.exec = async function (body, query, ctx) {
    const group = await this.service.admin.groups();
    const authList = await this.db.mongo.adminGroupAuth.find({});
    const gameidList = await this.db.mongo.bundle.getGameIdList();

    const onChange =   (key, value) => {
        console.log('this key', key, value, this.target.props.authMap)
        if (key === 'group_name'){
             const auth = this.target.props.authMap[value] || {serv: '', channel: []};
             this.target.state.data.serv = auth.serv;
             this.target.state.data.channel = auth.channel;
             this.target.setState({})
        }
    }
    const authMap = {};
    authList.forEach(a => {
        authMap[a.group] = {
            serv: `${a.serv.min}~${a.serv.max}`,
            channel: a.channel
        }
    })
    const children = {
        _type: 'AkForm',
        action: 'admin-group-auth',
        authMap,
        _: {
            onChange: onChange.toString()
        },
        form: [
            {
                key: 'group_name',
                name: ctx.i18n('部门'),
                require: true,
                type: 'select',
                style: {minWidth: '100%'},
                options: group,
            },
            {
                key: 'serv',
                name: '服务器范围',
                placeholder: "格式：1601~1699"
            },
            {
                key: "channel",
                name: "负责包ID",
                type: 'select',
                mode: "multiple",
                showSearch: true,
                style: {minWidth: '100%'},
                options: [ ...gameidList.map(o => o.name) ]
            }
        ]
    };
    return {
        children,
        width: "70%",
        maskClosable: false
    };
}
