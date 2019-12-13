const express = require('express');
const compression = require('compression');
const fs = require('fs');
const cheerio = require('cheerio');
const getProcessWithEnvVars = require('../scripts/get-process-with-env-vars');

const redirectToHttps = () => (request, response, next) => {
  if (request.headers['x-forwarded-proto'] !== 'https') {
    response.redirect(301, `https://${request.hostname}${request.url}`);
  } else {
    next();
  }
};

const serveStaticWithoutIndex = (root, indexPath) => {
  const static = express.static(root);
  return (request, response, next) => {
    if (request.path !== '/' && request.path !== indexPath) {
      static(request, response, next);
    } else {
      next();
    }
  };
};

const serveIndexWithEnvVars = fullIndexPath => {
  let html = fs.readFileSync(fullIndexPath, 'utf8');
  const $ = cheerio.load(html);
  const script = `<script>var process = ${JSON.stringify(getProcessWithEnvVars())};</script>`;
  $('body').append(script);
  html = $.html();
  return (_, response) => response.send(html);
};

const root = 'dist';
const indexPath = '/index.html';
const server = express();

server.enable('trust proxy');
server.use(redirectToHttps());
server.use(compression());
server.use(serveStaticWithoutIndex(root, indexPath));
server.get('/*', serveIndexWithEnvVars(root + indexPath));
server.listen(process.env.PORT);
