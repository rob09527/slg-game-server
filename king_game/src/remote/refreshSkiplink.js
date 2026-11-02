'use strict'

/**
 * 通知指定 channels 以及bundles 下的用户更新
 * @param data {object}
 */
module.exports = async function (data = {}) {
    let {channels = [], isshow = false, url = '', bundles = []} = data;
    console.log('[Resfresh Skiplink] data =', data);
    Object.values(CLIENT_POOL).forEach(client =>{
        if(client.role && channels.includes(client.role.channel)){
            console.log('[Resfresh Skiplink] channel =%s, bundle =',client.role.channel, client.role.bundle)
            if(bundles && bundles.length > 1){
                // 是否在设置的包名内
                isshow = bundles.includes(client.role.bundle);
            }
            client.emit("O_PUSH", {type:'skiplink', content: { isshow, url }});
        }
    })
    return "OK"
}