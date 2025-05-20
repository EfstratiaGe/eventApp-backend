
require('dotenv').config();

const express = require('express')
const mongoose = require('mongoose')
const app = express()

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

//routes
app.get('/', (req,res) => {
    res.send('Hello Eve/ Socialive')
})

app.get('/blog', (req,res) => {
    res.send('Hello Blog my name is Efi')
})


//MongoDB Connection & Setup
mongoose.set("strictQuery", false)
mongoose
.connect(MONGO_URI)
.then (() => {
    console.log('connected to MongoDB')
    app.listen(3000, ()=> {
        console.log('Event Booking App is running on port 3000')
    });   
})
.catch (() => {
    console.log(error)
})