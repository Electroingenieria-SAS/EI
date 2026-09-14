const {defineConfig}=require('@playwright/test');
module.exports=defineConfig({
  testDir:'./tests/browser',timeout:180000,workers:1,
  use:{baseURL:'http://127.0.0.1:8080',viewport:{width:1280,height:900},screenshot:'only-on-failure',trace:'retain-on-failure'},
  webServer:{command:'npm start',url:'http://127.0.0.1:8080',reuseExistingServer:!process.env.CI},
  reporter:[['list'],['html',{open:'never'}]]
});
