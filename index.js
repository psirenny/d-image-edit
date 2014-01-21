var config = {
  filename: __filename,
  ns: 'photo',
  scripts: {
    upload: require('./upload')
  }
};

module.exports = function(app, options) {
  app.createLibrary(config, options);
}