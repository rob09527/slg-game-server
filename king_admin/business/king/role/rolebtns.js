exports.name = '角色禁言和封停按钮框';
exports.type = 'O';
exports.inherit = 'role-view';


exports.exec = function (body, query, ctx) {
    const style = {marginRight: 8};
    body.def_prop = body.def_prop || {};
    body.ban = body.ban || {};
    body.mute = body.mute || {};

    if (body.mute.unforbid) { // 解禁操作
        body.mute.action = 'king-role-mute?unforbid=1';
        body.mute.children = '解除禁言';

        body.mute.confirm = `确认对 ${body.rname || '玩家'} 解禁么?`;
    } else { // 禁言操作
        body.mute.children = '禁言';
        body.mute.type = 'danger';
        body.mute.modal = {
            title: `设置禁言时间`,
            children: {
                _type: 'AkForm',
                confirm: `确认对 ${body.rname || '玩家'} 禁言么?`,
                action: 'king-role-mute',
                form: [
                    {
                        type: 'number',
                        name: '禁言时长(时)',
                        key: 'hour',
                        min: 1,
                        placeholder: '24'
                    }
                ]
            }
        };
        body.mute.confirm = undefined;
    }


    if (body.ban.expired && body.ban.expired > Date.now()) { // 解封操作
        body.ban.children = `解封(${new Date(body.ban.expired).format()})`;
        body.ban.confirm = `确认对 ${body.rname || '玩家'} 进行解封操作么?`;
        body.ban.action = 'king-role-ban?del=1';
    } else { // 封号操作
        body.ban.children = '封号';
        body.ban.type = 'danger';
        body.ban.modal = {
            title: `设置封停时间`,
            children: {
                _type: 'AkForm',
                confirm: `确认对 ${body.rname || '玩家'} 进行封号操作么?`,
                action: 'king-role-ban',
                form: [
                    {
                        type: 'number',
                        name: '封号时长(天)',
                        key: 'days',
                        min: 1,
                        placeholder: '365'
                    }
                ]
            }
        };
        body.ban.confirm = undefined;
    }

    return [
        ctx.actionSet.has('king-role-mute') ? {
            _type: 'AkButton',
            style: style,
            ...body.mute,
            data: body.data,
            ...body.def_prop
        } : null,
        ctx.actionSet.has('king-role-ban') ? {
            _type: 'AkButton',
            style,
            ...body.ban,
            data: body.data,
            ...body.def_prop
        } : null
    ].filter(Boolean)
};
