const express = require('express');
const kiteRouter = express.Router();
const controllers = require('../../controllers');
kiteRouter.get('/', controllers.kiteController.home);
kiteRouter.get('/callback', controllers.kiteController.callback);
kiteRouter.get('/profile', controllers.kiteController.profile);
kiteRouter.get('/holdings', controllers.kiteController.holdings);
kiteRouter.get('/mf_holdings', controllers.kiteController.mfHoldings);
kiteRouter.get('/all', controllers.kiteController.all);

module.exports = kiteRouter;