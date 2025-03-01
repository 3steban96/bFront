const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
const bodyParser = require('body-parser');
const route = require('./routes/route.js');
const pool = require('./DB/DBConnect.js');

app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Origin, X-Requested-With, Content-Type, Accept, x-auth-token']    
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/',route);
app.listen(port, pool,() => {
    console.log(`Server is running on port ${port}`);
});
