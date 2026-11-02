exports.name = '心跳超时';
exports.type = 'N';
exports.exec = async function (body, query, ctx) {
    this.remote.closeClientHeart(0, 4105, 'heart');
    return
};

