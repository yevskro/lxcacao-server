/* 
  Author: Yevgeniy Skroznikov
  Date: August 25 2020
  Description:
  This is the http express application. Since, the 
  handling of one route means there is no need to modularize
  with express router. Index.ts is creating the http server
  and the websocket server. Supertest is loading the express
  app into its own environment. 

  You will notice that some code has catch() on awaited promises
  this is due to have granular control on the error message
  and not respond with any information that an attacker could
  use. This is open source tho.. lol but eh. Best to slow em
  down.
*/

import express, { NextFunction, Request, Response } from 'express';
import { Server } from 'http';
import User, { RecipeData, CreateRecipeData } from '../models/User';

class HttpApp {
  private app: express.Application;

  constructor() {
    this.app = express();
    /* basic middleware setup */
    this.app.use(express.json());
    /* express routes setup */
    this.app.get('/users/:userId/recipes/:recipeId', HttpApp.getUsersRecipe);
    this.app.get('/users/:userId/recipes', HttpApp.getUsersRecipes);
    this.app.patch('/users/:userId/recipes/:recipeId', HttpApp.editUsersRecipe);
    this.app.post('/users/:userId/recipes', HttpApp.createUserRecipe);
    this.app.delete(
      '/users/:userId/recipes/:recipeId',
      HttpApp.deleteUsersRecipe
    );
    this.app.get('/users', HttpApp.getUserByGmailQuery);
    this.app.get('/error', HttpApp.getErrorTest);
    this.app.use(HttpApp.globalErrorHandler);
  }

  /* public static async poolEnd(): Promise<void> {
    return User.poolEnd();
  } */

  public getApp(): express.Application {
    /* get app for testing purposes, freeze it 
    to protect it from being misused */
    return Object.freeze(this.app);
  }

  public listen(port: number): Server {
    return this.app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Http Server is listening on port:`, port);
    });
  }

  private static async getUsersRecipe(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    /* get the recipe that belongs to a user, the recipeId is also
    the rowId in users_recipes table */
    const ownerId = 1;
    const userId = Number(req.params.userId);
    const recipeId = Number(req.params.recipeId);
    let error: Error;

    const authorized = await User.isAuthorized(ownerId, userId).catch(() => {
      error = new Error('failed to process authorization');
    });
    if (error) return next(error);

    if (!authorized) return res.sendStatus(403);

    const readData = await User.readRecipe(recipeId, {
      all: true,
    }).catch(() => {
      error = new Error('failed to read recipe');
    });
    if (error) return next(error);

    /* if no recipe was found undefined is returned */
    if (!readData) return res.sendStatus(404);
    /* if the recipe is private only the owner can see it */
    if (readData.private && ownerId !== userId) return res.sendStatus(403);
    return res.status(200).json(readData);
  }

  private static async getUsersRecipes(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    /* get all the recipes that belong to a user with the user id */
    const ownerId = 1;
    const userId = Number(req.params.userId);
    let error: Error;

    const authorized = await User.isAuthorized(ownerId, userId).catch(() => {
      error = new Error('failed to process authorization');
    });
    if (error) return next(error);

    if (!authorized) return res.sendStatus(403);

    let readData = await User.readAllRecipes(userId, {
      all: true,
    }).catch(() => {
      error = new Error('failed to read recipes');
    });
    if (error) return next(error);

    /* if readData is undefined non were found */
    if (!readData) res.sendStatus(404);

    if (ownerId !== userId) {
      readData = (readData as RecipeData[]).filter(
        (data: RecipeData) => !data.private
      );
    }

    return res.status(200).json(readData);
  }

  private static async editUsersRecipe(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    /* edit fields of a recipe that belongs to the user */
    const ownerId = 2;
    const userId = Number(req.params.userId);
    const recipeId = Number(req.params.recipeId);
    const authorized = ownerId === userId;
    let error: Error;

    if (!authorized) return res.sendStatus(403);

    await User.updateRecipe(recipeId, req.body).catch(() => {
      error = new Error('failed to update recipe');
    });
    if (error) return next(error);

    return res.sendStatus(204);
  }

  private static async createUserRecipe(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    /* create a recipe that will belong to user with the userId */
    const ownerId = 2;
    const userId = Number(req.params.userId);
    const createRecipeData: CreateRecipeData = req.body;
    const authorized = ownerId === userId;
    let error: Error;

    if (!authorized) return res.sendStatus(403);

    await User.createRecipe(createRecipeData).catch(() => {
      error = new Error('failed to create recipe');
    });
    if (error) return next(error);

    return res.sendStatus(201);
  }

  private static async deleteUsersRecipe(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    /* delete a recipe that belongs to the user */
    const ownerId = 2;
    const userId = Number(req.params.userId);
    const recipeId = Number(req.params.recipeId);
    const authorized = ownerId === userId;
    let error: Error;

    if (!authorized) return res.sendStatus(403);

    await User.deleteRecipe(recipeId).catch(() => {
      error = new Error('failed to delete recipe');
    });
    if (error) return next(error);

    return res.sendStatus(204);
  }

  private static async getUserByGmailQuery(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    /* route created to search for a user with a
     gmail */
    if (!req.query.gmail) return res.sendStatus(204);

    const { gmail } = <{ gmail: string }>req.query;
    const gmailRgx = /([a-zA-Z0-9]+)([.{1}])?([a-zA-Z0-9]+)@gmail([.])com/g;
    let error: Error;

    if (!gmailRgx.test(gmail)) return res.sendStatus(400);

    const userData = await User.readUserByGmail(gmail, {
      gmail: true,
      first_name: true,
      last_name: true,
    }).catch(() => {
      error = new Error('failed to read recipe');
    });
    if (error) return next(error);

    if (userData) return res.status(200).json(userData);

    return res.sendStatus(404);
  }

  private static getErrorTest() {
    /* testing error route */
    throw new Error('testing error route');
  }

  private static globalErrorHandler(
    err: Error,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
  ) {
    /* express global error handler */
    /* delegate to default error handler when error in the 
    middle of writing a response */
    if (res.headersSent) return next(err);
    return res.status(500).send(err.message);
  }
}

export default HttpApp;
