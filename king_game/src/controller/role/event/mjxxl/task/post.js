module.exports = exports = async (ctx) => {
    let { index } = ctx.request.body;
    const { taskRewards } = ctx.gameCache.mjxxl

    ctx.assert(taskRewards[index].state == 0, 'Repeatedly claiming prizes');
    ctx.assert(taskRewards[index].user_count >= taskRewards[index].reward_count, 'Condition not met');
    ctx.gameCache.mjxxl.taskRewards[index].state = 1
    ctx.gameCache.mjxxl.frequency += 1

    ctx.body = ctx.gameCache.mjxxl.frequency
}
