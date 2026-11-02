
'use strict'

const chkAndAdd = require('./common/chkAndAdd');
/**
 * 累计参与&胜利个人演武
 * @param {*} param0 type 默认参与
 * @returns 
 */
module.exports = function ({ type = 'join', count }) {
    return type != 'win' ? chkAndAdd.call(this,{
        zbId: 57440,
        mark: 98448,
        count,
        subreason: 'pvp'
    }) : chkAndAdd.call(this,{
        zbId: 57520,
        mark: 98454,
        count,
        subreason: 'win_pvp'
    })
}