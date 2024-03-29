import express from 'express';
import mongoose from 'mongoose';

import defaultController from './controller/defaultController';

export default async function(): Promise<express.Express> {
  const app = express();

  try {
    const mongoUrl =`mongodb://${process.env.DB_HOST ?? 'localhost'}:${process.env.DB_PORT ?? '27017'}/${process.env.DB_NAME ?? 'lasermatti'}`;
    
    await mongoose.connect(mongoUrl, {
      connectTimeoutMS: 5000,
    });
  
    console.log('Successfully connected to the database.');
  } catch (error) {
    console.log('Not successfully connected to the database.');
    console.log(error);
  }

  app.use(express.json());
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');

    if ('OPTIONS' === req.method) res.sendStatus(200);
    else next();
  });
  app.use('/', defaultController);

  return app;
}
