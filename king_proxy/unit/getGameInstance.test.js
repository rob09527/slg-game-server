

const assert = require('assert');
const testfn = require('./../src/model/token/static/getGameInstance');

/**
 * 设置test环境
 */
const setEnv = function() {
  global.gameservs = {  // 节点信息
    'cldev:8401': {
      port: 8401,
      host: 'cldev',
      online_count: 8,
    },
    'cldev:8300': {
      port: 8300,
      host: 'cldev',
      online_count: 7,
    },
    'cldev:8301': {
      port: 8301,
      host: 'cldev',
      online_count: 6,
    },
    'cldev:8303': {
      port: 8303,
      host: 'cldev',
      online_count: 5,
    },
  }
}

const testCase = [
  function() {
    const node = testfn(9024);
    assert.ok(node.port === 8303, 'specify 9024 err, must port 8303');
  },
  function() {
    const node = testfn(9101);
    assert.ok(node.port === 8401, 'specify 9101 err, must port 8401');
  },
  function() {
    const node = testfn(9009);
    assert.ok(node.port === 8300 || node.port === 8301, '未指定服务器应该返回节点端口8300|8301, 但返回'+node.port)
  }
]


async function main () {
  setEnv(); //设置环境
  testCase.forEach(_case => _case());
  console.log('all test accept √');
}

main().catch(console.error);