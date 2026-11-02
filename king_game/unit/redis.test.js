module.exports = async () => {
    // 测试 RankService
    const RankService = global.services.RankService;
    const rankService = new RankService('test');

    const size = await rankService.size()
    console.log('current size', size);

    await rankService.set({id: 'A', score: 5}, {id: 'B', score: 3}, {id: 'C', score: 10});

    await rankService.inc('A', 3);

    const a_rank = await rankService.getItemRank('A');
    const a_score = await rankService.getItemScore('A');
    const c_rank = await rankService.getItemRank('C');
    const d_rank = await rankService.getItemRank('D');
    console.log('A', a_rank, 'score is', a_score, '  -- C rank is', c_rank, ' -- D is', d_rank);
    // await rankService.delByRank( 1, 2); // 删除1-2 名
    // await rankService.delByRank( -1, -1); // 删除倒数第1名
    // await rankService.delByRank( 2, -1); // 删除第二名 到 倒数第1名
    // await rankService.del('A');
    const rank = await rankService.rank(); // 查询 1- 100名的数据
    console.log('get rank ', rank)
}
