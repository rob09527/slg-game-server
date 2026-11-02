
'use strict'

const assert = require('assert');
// 国战-移除玩家某一小队的队伍
module.exports = async function (field_name,value,groupid) {
	// 更新国号或者国名
    const ONLY_FIELS = [
        'name',
        'icon',
    ]
    assert(ONLY_FIELS.includes(field_name), 'invalid field');
    let nation_info = await this.nationwar_serverinfo.findOne({groupid});
    assert(nation_info,'no info');
    let udp = {
        $set: {
            [field_name]: value
        }
    }
    await this.nationwar_serverinfo.updateOne({groupid},udp);
}
