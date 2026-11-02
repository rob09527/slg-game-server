const ObjectId = require('mongodb').ObjectId;
exports.name = '公告编辑';
exports.type = 'O';
exports.backIcon = true; // 返回图标开启
exports.exec = async function (body, query, ctx) {
    const id = query.id;
    const noticeModel = await this.service.game.collection('notices');
    const one = await noticeModel.findOne({_id: ObjectId(id)});

    return {

        _type: 'NoticeEditor',
        content: one.content || "",
        action: 'king-notice-update?id=' + id,
        fontSizes: {
            'x-small': {name: 'x-small', value: '1'},
            'small': {name: 'small', value: '2'},
            'normal': {name: 'normal', value: '3'},
            'large': {name: 'large', value: '4'},
            'x-large': {name: 'x-large', value: '5'},
            'xx-large': {name: 'xx-large', value: '6'},
            'xxx-large': {name: 'xxx-large', value: '7'},
        }
    }

};

