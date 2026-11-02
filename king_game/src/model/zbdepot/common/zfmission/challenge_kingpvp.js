
'use strict'

const chkAndAdd = require('./common/chkAndAdd');
/**
 * 累计参与&胜利王者演武
 * @param {*} param0 type 默认参与
 * @returns 
 */
module.exports = function ({ type = 'join', count }) {
    return type != 'win' ? chkAndAdd.call(this,{
        zbId: 57400,
        mark: 98449,
        count,
        subreason: 'kingpvp'
    }) : chkAndAdd.call(this,{
        zbId: 57500,
        mark: 98453,
        count,
        subreason: 'win_kingpvp'
    })
}