'use strict';
/**
 * 绑定 members
 */
module.exports = async function () {

    if (this.auctioneer.startsWith('legion')) { // 军团分红
        const lid = this.auctioneer.replace('legion_', '');
        const legion = await this.db.models.legion.findOne({_id: lid}, {_members: 1});
        if (legion) {
            this._members = legion._members;
        } else {
            this._members = [];
        }
    }
};
