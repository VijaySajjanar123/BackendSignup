const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/contacts', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error('MongoDB connection error:', error));

// Define Contact schema
const contactSchema = new mongoose.Schema({
  name: String,
  mobile: String,
  email: String
});
const Contact = mongoose.model('users', contactSchema);

app.use(bodyParser.json());

// Generate JWT token function
function generateToken(username) {
  return jwt.sign({ username }, 'your_secret_key', { expiresIn: '1h' }); // Token expires in 1 hour
}

// Define routes

// Save Contact route
app.post('/api/contacts', async (req, res) => {
  const { name, mobile, email } = req.body;
  const errors = {};

  // Validate each field
  if (!name) {
    errors.name = 'Name is required';
  }
  if (!mobile) {
    errors.mobile = 'Mobile number is required';
  }
  if (!email) {
    errors.email = 'Email is required';
  }

  // If there are errors, return them
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    const contact = new Contact({ name, mobile, email });
    await contact.save();

    // Generate JWT token
    const token = generateToken(name);

    // Send success message with token
    return res.status(201).json({ success: true, data: { name, mobile, email }, message: 'login successfully', token });
  } catch (error) {
    console.error('Error saving contact:', error);
    return res.status(500).json({ success: false, error: 'Something went wrong' });
  }
});

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



