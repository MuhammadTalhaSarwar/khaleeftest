const express = require('express');

const routes = require('./routes'); // import the routes
const parsedConfig=require('dotenv').config({path:'./.env'}).parsed;
const app = express();
const PORT = parsedConfig.PORT || 3000;
if(parsedConfig.NODE_ENV === 'production') {
  const cluster = require('cluster');
  const numCPUs = require('os').cpus().length;
  if (cluster.isMaster) {
    //console.log(`Master ${process.pid} is running`);
  
    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
  
    cluster.on('exit', (worker, code, signal) => {
      //console.log(`worker ${worker.process.pid} died`);
      cluster.fork();
    });
  } else {
    //console.log(`Worker ${process.pid} started`);
  
    app.use('/', routes);
  
    app.listen(PORT, () => {
      console.log(`Worker ${process.pid} listening on port ${PORT}`);
    });
  }
}else{
  app.use('/', routes);
  
  app.listen(PORT, () => {
    console.log(`MASTER ${process.pid} listening on port ${PORT}`);
  });
}

module.exports = app;
