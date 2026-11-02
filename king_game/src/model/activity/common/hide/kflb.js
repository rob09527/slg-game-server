/**
 * 开服礼包
 */

module.exports = function(ext = '') {
  let type = 'kflb' + ext;
  return function(role) {
    return Object.entries(this.params.sppack).every((k, rw) => {
      if (rw.limit <= -1) return false; // 该档位无限购买
      if (!role[type]) return false;  // 从未购买礼包
      if (!role[type][k]) return false; // 从未购买该档位
      if (role[type][k].times < rw.limit) false;  // 未到购买上限
      return true;
    })
  }
}