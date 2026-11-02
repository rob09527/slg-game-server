exports.name = '军团邮件弹框';
exports.type = 'I';
exports.inherit = 'legion-info-view';
exports.exec = async function (body, query, ctx) {

    const {members, servid} = body;
    const mailForm = util.getMailForm();

    return {
        maskClosable: false,
        width: '65%',
        children: {
            _type: "AkForm",
            data: {
                roles: members.map(m => m.value),
                servid
            },
            form: [
                {name: '服务器', key: 'servid', disabled: true},
                {
                    name: '角色',
                    key: 'roles',
                    mode: "multiple",
                    type: 'select',
                    showSearch: true,
                    style: {minWidth: 180},
                    options: members
                },
                ...mailForm
            ],
            action: `king-mail-send`
        }
    }
};

