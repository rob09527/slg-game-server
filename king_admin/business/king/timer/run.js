exports.name = '定时任务执行';
exports.type = 'N';
exports.exec = async function (body, query, ctx) {

    const {id} = body;

    this.remote.agent_runtask(id).catch(console.error); // 异步执行定时器
    await util.sleep(1000); // 略微等待，保证定时器状态刷新
    return 'OK';
}
