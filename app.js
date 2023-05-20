const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const port = process.env.PORT || 3000;

// Connect to MongoDB database
mongoose.connect('mongodb+srv://mwauraanthony11:anthony123@cluster0.zqedtfx.mongodb.net/ussd-app', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Define location schema
const locationSchema = new mongoose.Schema({
  name: String,
  insulinAccessPoint: String
});

const Location = mongoose.model('Location', locationSchema);

// Define user schema
const userSchema = new mongoose.Schema({
  name: String,
  idNumber: String,
});

const User = mongoose.model('User', userSchema);

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/', async (req, res) => {
  // Read the variables sent via POST from our API
  const { sessionId, serviceCode, phoneNumber, text } = req.body;

  let response = '';

  if (text === '') {
    response = `CON Welcome to SugarSpot, please enter your ID number:`;
  } else if (text.length === 8) { // Check if ID number is valid
    try {
      // Fetch user from database
      const user = await User.findOne({ idNumber: req.body.text });

      if (user) {
        response = `CON Welcome ${user.name}, what is your current location?`;
      } else {
        response = 'END Invalid ID number, please try again:';
      }
    } catch (error) {
      console.log(error);
      response = 'END Error fetching user from database';
    }
  } else {
    response = 'END Invalid ID number, please try again:';
  }

  if (text !== '') {
    try {
      const location = await Location.findOne({ name: req.body.text });

      if (location) {
        response = `END The nearest insulin access point is ${location.insulinAccessPoint}`;
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
