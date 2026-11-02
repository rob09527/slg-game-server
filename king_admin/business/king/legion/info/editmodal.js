exports.name = '军团编辑弹框';
exports.type = 'I';
exports.inherit = 'legion-info-view';
exports.exec = async function (body, query, ctx) {

    const {name, members, notice, ceo, servid} = body;

    return {
        maskClosable: false,
        width: '65%',
        children: {
            _type: 'AkForm',
            action: 'king-legion-info-edit',
            data: {
                _id: body._id,
                name,
                notice,
                ceo
            },
            form: [
                {
                    key: 'name',
                    name: '军团名'
                },
                {
                    key: 'notice',
                    name: '军团公告'
                },
                {
                    key: 'ceo',
                    name: '任命团长',
                    options: members,
                    type: 'select',
                    style: {width: '100%'}
                }
            ],
            confirm: '确认修改军团信息么？'
        }
    }
};

