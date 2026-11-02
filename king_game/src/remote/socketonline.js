module.exports = async function () {
    let info = {}
    for (let x in CLIENT_POOL) {
        try {
            socket = CLIENT_POOL[x]
            if (!info[socket['servid']]) {
                info[socket['servid']] = {}
            }
            if (!info[socket['servid']][socket['channel']]) {
                info[socket['servid']][socket['channel']] = {
                    h5: 0,
                    android: 0,
                    ios: 0,
                    wechatgame: 0,
                    other: 0,
                    channel: socket['channel'],
                    serverid: socket['servid'],
                }
            }
            socket['platform'] ? info[socket['servid']][socket['channel']][socket['platform']] += 1 : info[socket['servid']][socket['channel']][socket['other']] += 1
        } catch (error) {
            console.error(error, 'sockeronline', socket)
        }

    }
    return info
}
