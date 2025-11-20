const express = require('express');
const infoRouter = require('./info.controller');
const kiteRouter=require('./kite.router');
const router = express.Router();
router.use('/info', infoRouter);
router.use('/kite',kiteRouter);
module.exports = router;