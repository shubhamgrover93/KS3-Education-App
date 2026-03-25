const r = require('express').Router();
const c = require('../controllers/reflection.controller');

r.post('/', c.submit);
r.get('/studentHistory/:studentId/:classId/:week', c.history);
r.get('/teacherHistory/:classId/:week/:team_id', c.teacherHistory);

module.exports = r;