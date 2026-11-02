'use strict'
// 军团名
module.exports = exports = async function () {
    if (!this.legion) {
        return;
    }
    let legion = await this.db.models.legion.findOne({_id: this.legion}, {name: 1});
    if (!legion) return;
    return legion.name;
}
