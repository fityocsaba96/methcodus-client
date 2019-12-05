const express = require('express');
const compression = require('compression');

const app = express();
const root = 'dist';

app.use(compression());
app.use(express.static(root));
app.get('/*', (_, res) => res.sendFile('/', { root }));
app.listen(process.env.PORT);
