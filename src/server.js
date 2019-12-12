const express = require('express');
const compression = require('compression');
const fs = require('fs');
const cheerio = require('cheerio');

const getProcessWithEnvVars = require('../scripts/get-process-with-env-vars');

const root = 'dist';
const indexPath = '/index.html';

const getHtmlWithEnvVars = () => {
  const html = fs.readFileSync(root + indexPath, 'utf8');
  const $ = cheerio.load(html);
  const script = `<script>var process = ${JSON.stringify(getProcessWithEnvVars())};</script>`;
  $('body').append(script);
  return $.html();
};

const html = getHtmlWithEnvVars();
const static = express.static(root);
const server = express();

server.use(compression());
server.use((request, response, next) => {
  if (request.path !== '/' && request.path !== indexPath) {
    static(request, response, next);
  } else {
    next();
  }
});
server.get('/*', (_, response) => response.send(html));
server.listen(process.env.PORT);
