exports.name = '版本审核期设定';
exports.type = 'N';
exports.exec = async function (body, query, ctx) {

    let {appversion = '', isreview = false} = body;
    isreview = isreview == 'true' ? true : false
    const preview = await this.remote.proxy_set_version_review(appversion, isreview);
    return preview;
};

