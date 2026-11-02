
'use strict'

const assert = require('assert');

module.exports = exports = async function (guids = []) {
  if (!Array.isArray(guids)) guids = [guids];
  let books = [];
  for (let _id of guids) {
    let book = this.findOne({_id});
    assert(book, 'book nexist');
    let config = global.gameconfig.bookitems[book.gsid];
    assert(config, 'invalid bookgsid');
    books.push({
      book,
      config,
    })
  }
  return books;
}