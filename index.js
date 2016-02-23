#!/usr/bin/env node

var http = require('http');
var request = require('request');
var logger = require('./logger');

var health_check_port = process.env.HEALTH_CHECK_PORT || 4000;
var proxy = process.env.PROXY
var destination = process.env.DESTINATION
var responding_server_port = health_check_port+1;

if (!proxy) {
  logger.error('PROXY env variable is required');
  process.exit(1);
}


if (!destination) {
  logger.error('DESTINATION env variable is required');
  process.exit(1);
}

// Create health check server
var server = http.createServer(function(req, res) {
  logger.info('Starting Proxy request');

  var options = {
    'url': destination,
    'proxy': proxy
  }

  request(options, function (error, response, body) {
    if (error || response.statusCode !== 200) {
      logger.info('Proxy request failed');
      res.writeHead(500, { "Content-Type": "text/html" });
      return res.end();
    }

    logger.info('Proxy request succeeded');
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end();
  });
});

// Start health check server
server.listen(health_check_port, function() {
  logger.info('Health check server listening to port '+health_check_port);
});
