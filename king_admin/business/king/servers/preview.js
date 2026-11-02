exports.name = '定向审核服设定';
exports.type = 'N';
exports.exec = async function (body, query, ctx) {

    const {appversion = '', platform, bundle} = body;
    const appversion_ = appversion.split(',');
    const platform_ = platform ? platform : null;
    const bundle_ = bundle ? bundle.split(',') : null;
    const preview = await this.remote.proxy_set_preview(appversion_, platform_, bundle_);
    return preview;
};

