const express = require('express')
const app = express()

//routes
app.get('/', (req,res) => {
    res.send('Hello Socialive')
})

app.listen(3000, ()=> {
    console.log('Event Booking App is running on port 3000')
})