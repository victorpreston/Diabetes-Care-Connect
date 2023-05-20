const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const port = process.env.PORT ||5000;

// Connect to MongoDB database
mongoose.connect('mongodb+srv://mwauraanthony11:anthony123@cluster0.zqedtfx.mongodb.net/test', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Define location schema
// const locationSchema = new mongoose.Schema({
//   lname: String,
//   insulinAccessPoint: String
// });

// const Location = mongoose.model('Location', locationSchema);


const schema = new mongoose.Schema({
  name : {
      type : String,
      required: true
  },
  email : {
      type: String,
      required: true,
      unique: true
  }
})

const Userdb = mongoose.model('userdb', schema);

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/', async (req, res) => {
  // Read the variables sent via POST from our API
  const { sessionId, serviceCode, phoneNumber, text } = req.body;

  let response = '';

  if (text === '') {
    response = `CON Welcome to SugarSpot, what is your current Location?`;
  } else {
    try {
      // Fetch selected location from database
      const location = await Userdb.findOne({ name: req.body.text });

      if (location) {
        response = `END The nearest Insulin access point is ${location.email}`;
      } else {
        response = 'END Sorry, we couldn\'t find the nearest insulin access point for your location. Please try again with a different location.';
      }
    } catch (error) {
      console.log(error);
      response = 'END Error fetching location from database';
    }
  }

  // Send the response back to the API
  res.set('Content-Type: text/plain');
  res.send(response);
});

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
