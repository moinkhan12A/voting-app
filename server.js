const express = require('express')
const app = express();
const db = require('./db')

require('dotenv').config();

app.use(express.json())
const PORT = process.env.PORT || 3000;

const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes')

app.use('/user',userRoutes)
app.use('/candidate',candidateRoutes)

app.listen(PORT, ()=>{
    console.log('listening on port 3000');
})