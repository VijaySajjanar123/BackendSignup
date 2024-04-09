const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/contacts', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    console.log(process.env.MONGODB_URI); // Logging MongoDB URI
  })
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

// Get Contacts route
app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find(); // Retrieve all contacts from the database
    if (contacts.length === 0) {
      return res.status(404).json({ success: false, message: 'No contacts found' });
    } else {
      return res.status(200).json({ success: true, message: 'Contacts retrieved successfully', data: contacts });
    }
  } catch (error) {
    console.error('Error retrieving contacts:', error);
    return res.status(500).json({ success: false, error: 'Something went wrong', details: error.message });
  }
});

// Save Contact route - Placeholder for future implementation
app.post('/api/contacts', async (req, res) => {
  return res.status(501).json({ success: false, error: 'Not Implemented' });
});

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
