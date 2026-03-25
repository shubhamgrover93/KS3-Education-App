const r = require('express').Router();
const c = require('../controllers/class.controller');

r.post('/start', c.startClass);
r.get('/:code/scoreboard', c.scoreboard);
r.get('/list', c.listClasses);

module.exports = r;