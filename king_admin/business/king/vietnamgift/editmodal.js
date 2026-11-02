exports.name = '服务器编辑框';
exports.type = 'I';
exports.inherit = 'servers-view';
const moment = require('moment');
exports.exec = async function (body, query, ctx) {
    const websaleconfigs = await this.service.game.collection('websaleconfigs');
    const data = await websaleconfigs.findOne({
        packageid: body.packageid
    });
    const form = [
        {
            key: 'state',
            name: '状态',
            type: 'select',
            style: { minWidth: 180 },
            options: [{ name: '待审核', value: 1 }, { name: '通过', value: 2 }, { name: '驳回', value: 3 }, { name: '下架礼包', value: 4 }],
            require: true,
        }]
    return {
        children: {
            _type: 'AkForm',
            data: data,
            form: form,
            action: 'king-vietnamgift-edit',
            confirm: '确认修改吗'
        }

    }
};



