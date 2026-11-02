

module.exports = exports = function (prisonerDoc) {
    let info = {};
    let rating = -1
    prisonerDoc.map(e => {
        let config = global.gameconfig.surrender.deepQueryOne('GSID', e.gsid);
        e.cost = config.CAST
        e.kill = config.KILL
        if (config.RATING > rating) {
            info = config
            rating = config.RATING
        }
    })
    return info
}