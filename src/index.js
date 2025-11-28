// aur kuch suggestions ho toh batao change karr skate ho as per your convinence but get it reviewed first.
const express = require('express');
const morgan = require('morgan');
const { ServerConfig, Logger } = require('./config');
const apiRoutes = require('./routes');
const { correlationMiddleware, errorMiddleware } = require('./middlewares');
const app = express(); // express app ka instance hai
app.use(express.json());
app.use(express.urlencoded({ extended: true }));// if aage koi aur type ka data ata hai toh add karte jao parsers
app.use(correlationMiddleware);// har ek request ki id abaneyga to trace it.
morgan.token('id', (req) => req.correlationId || 'unknown');
app.use(morgan(':method :url :status :response-time ms [cid::id]'));
app.use('/api', apiRoutes);
// error handlers last mei rakha hai
app.use(errorMiddleware.appErrorHandler);
app.use(errorMiddleware.genericErrorHandler);
app.listen(ServerConfig.PORT, () => {
    Logger.info(`Server is running on http://localhost:${ServerConfig.PORT}`);
    Logger.info(`Press Ctrl+C to stop the server.`);
});