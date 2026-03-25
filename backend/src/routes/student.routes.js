const r = require('express').Router();
const c = require('../controllers/student.controller');

r.post('/join', c.joinClass);
r.get('/detail/:studentCode', c.getStudentByCode);

module.exports = r;