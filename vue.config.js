const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  devServer:{
    proxy:{
      'gen':{
        target:'http://localhost:8080',
        changeOrigin:true
      },
      'check':{
        target:'http://localhost:8080',
        changeOrigin:true
      },
    }
  }

})
