
/*
 * GET home page.
 */

module.exports = function(app, io) {
  var index = function(req, res) {
    res.render('index')
  };
  return {
    index: index,
  }
}
