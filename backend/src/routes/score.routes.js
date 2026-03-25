const r = require('express').Router();
const c = require('../controllers/score.controller');

r.post('/assign', c.assign);

module.exports = r;