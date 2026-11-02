
//是否满足劫狱条件
module.exports = exports = function (prisonerDoc) {
    // let config = global.gameconfig.surrender.deepQueryOne('GSID', prisonerDoc.gsid);
    // < config.CD * 6000
    let time = global.gameconfig.surrenderfight[4][0].LEAVETIME * 60000 + 120000
    if (prisonerDoc.imprisonmentTime - time > Date.now() && prisonerDoc.state == 0) {
        return true
    } else {
        //console.log(Date.now(), prisonerDoc._id, prisonerDoc.imprisonmentTime, global.gameconfig.surrenderfight[4][0].LEAVETIME * 60000, "false")
        return false
    }

}

