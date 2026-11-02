exports.name = '聊天过滤文字';
exports.type = 'I';
exports.inherit = 'chat-view';

exports.exec = async function (body, query, ctx) {
    const {filter} = body;
    this.remote.proxy_set_global({chat_filter: filter});
};

