import 'dotenv/config';
import { DB_Name } from './constant.js'
import { DBConnection } from './connection.js';
import { router } from './src/routes/user.route.js'
import { app } from './app.js';
import { Articlerouter } from './src/routes/article.route.js';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




// user  routes : 
app.use('/api/v1/users', router);


// articles routes : 
app.use('/api/v1/articles', Articlerouter);

// Serve frontend
app.use(express.static(path.join(__dirname, 'frontend')));

const port = process.env.PORT || 2000;


app.listen(port, () => console.log(`Server running on port: ${port}`));


DBConnection().then(() => { console.log(` ${DB_Name} connected successfully`); }).catch(
    (err)=>{
        console.error(`Error connecting ${DB_Name}:`, err);
        process.exit(1);
    });


