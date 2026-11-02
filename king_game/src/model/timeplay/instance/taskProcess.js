'use strict'

const assert = require('assert');

module.exports = exports = async function (id, role) {
    const config = global.gameconfig.chapter_new_event.TASK[this.index];
    const t = config.find(c => c.ID === id);
    let doneCount = 0;

    const task_process = this.task_process || {};
    if (t.EVENT.startsWith('EVENT_')) {
        let event_key = t.EVENT + '_' + (t.REQUIRE_INFO ? t.REQUIRE_INFO : '');
        return task_process[event_key] || 0;
    } else if (t.EVENT.startsWith('PROP_')) {
        const prop = t.EVENT.replace('PROP_', '');
        doneCount = role.getProp(prop);
    }
    return doneCount;
}
