import app from './app.js';
import {env} from './config/env.js';
// Start the server
app.listen(env.port, ()=>{
    console.log(`Auth server running on port ${env.port}`);
});