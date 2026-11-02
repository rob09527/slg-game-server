exports.name = '跳转链接';
exports.type = 'N';
exports.exec = async function (body, query, ctx) {
    let {channels, isshow, url} = body;
    console.log('[Skiplink] body =', body)
    if (!channels) throw 'miss channels';
    if (!url || (url.indexOf('https://') < 0 && url.indexOf('http://') < 0)) throw 'miss url';
    if (!isshow) throw 'miss isshow';

    isshow = isshow == 'true' ? true : false;
    
    // 是否包含全渠道设置
    if(channels.indexOf('ALL') >= 0){
        channels = ['']
    }
    const skiplinkModel = await this.service.game.collection('skiplinks');
    for(const c of channels) {
        let filter = c ? { channel: c } : {}
        
        await skiplinkModel.findOneAndUpdate(filter, {$set: { channel: c, isshow, url }}, { upsert:true });
    }

    const res = await this.remote.refreshSkiplink({channels, isshow, url}); //

    return res;
};