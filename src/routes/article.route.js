import { Router } from "express";
import { createArticle, getSingleArticle, serachArticle , getArticle, deleteArticle, updateArticle, getPlatformStats } from "../controllers/article.Controller.js";
import { JwtVerification } from "../middlewares/jwt.auth.js";

const Articlerouter = Router();

Articlerouter.post('/creates'                           , JwtVerification, createArticle);
Articlerouter.get('/stats'                              , getPlatformStats);
Articlerouter.get('/'                                   , getArticle);
Articlerouter.get('/getsingleArticle/:title'            , getSingleArticle);
Articlerouter.delete('/deleteArticle/:articleId'        , JwtVerification, deleteArticle);
Articlerouter.put('/updateArticle/:articleId'           , JwtVerification, updateArticle);
Articlerouter.get('/search'                             , serachArticle);


export { Articlerouter };