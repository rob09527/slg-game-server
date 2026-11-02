const fs = require("fs");

const files = fs.readdirSync(__dirname);
const schedules = [];
for (const f of files) {
    if (f === 'index.js' || !f.endsWith('.js')) {
        continue;
    }
    const task = require('./' + f);
    task.ID = f.replace('.js', ''); // 给任务添加一个唯一ID,按定时器文件名
    Object.defineProperty(task, 'ID', {
        writable: false
    });
    Object.defineProperty(task, 'name', {
        writable: false
    });
    Object.defineProperty(task, 'main', {
        writable: false
    });
    Object.defineProperty(task, 'check', {
        writable: false
    });
    schedules.push(task);
}

module.exports = schedules;
