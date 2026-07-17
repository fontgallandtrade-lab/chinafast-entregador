const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  
  config.transformer.minifierConfig = {
    compress: {
      drop_console: true,
    },
  };
  
  return config;
})();
