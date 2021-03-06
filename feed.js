var ejs = require('ejs'),
  merge = require('utils-merge'),
  path = require('path'),
  file = hexo.util.file2;

ejs.filters.cdata = function(str){
  return '<![CDATA[' + (str || '') + ']]>';
};

var atomTmplSrc = path.join(__dirname, 'atom.ejs'),
  atomTmpl = ejs.compile(file.readFileSync(atomTmplSrc));

var rss2TmplSrc = path.join(__dirname, 'rss2.ejs'),
  rss2Tmpl = ejs.compile(file.readFileSync(rss2TmplSrc));

module.exports = function(locals, render, callback){
  var config = hexo.config;

  var feedConfig = merge({
    type: 'atom',
    limit: 20
  }, config.feed);

  var limit = (feedConfig.limit === false) ? undefined : feedConfig.limit;

  // Restrict feed type
  if (feedConfig.type !== 'atom' && feedConfig.type !== 'rss2'){
    feedConfig.type = 'atom';
  }

  // Set default feed path
  if (!feedConfig.path){
    feedConfig.path = feedConfig.type + '.xml';
  }

  // Add extension name if don't have
  if (!path.extname(feedConfig.path)){
    feedConfig.path += '.xml';
  }

  // Determine which template to use
  if (feedConfig.type === 'rss2'){
    var template = rss2Tmpl;
  } else {
    var template = atomTmpl;
  }

  var xml = template({
    config: config,
    posts: locals.posts.sort('date', -1).limit(limit),
    feed_url: config.root + feedConfig.path
  });

  hexo.route.set(feedConfig.path, xml);
  callback();
};
