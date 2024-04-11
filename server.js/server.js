const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb+srv://Vijay:vijay%40123@cluster0.uhpu6ez.mongodb.net/travel', { useNewUrlParser: true, useUnifiedTopology: true })
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
  return jwt.sign({ username }, 'your_secret_key', { expiresIn: '1h' });  //Token expires in 1 hour 
}

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
    return res.status(201).json({ success: true, data: { name, mobile, email }, message: 'Contact saved successfully', token });
  } catch (error) {
    console.error('Error saving contact:', error);
    return res.status(500).json({ success: false, error: 'Something went wrong' });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  const { mobile } = req.body;
  const errors = {};
  // Validate mobile field
  if (!mobile) {
    errors.mobile = 'Mobile number is required';
  }
  // If there are errors, return them
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }
  try {
    // Find user in the database
    const user = await Contact.findOne({ mobile });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    // Generate JWT token
    const token = generateToken(mobile); // Using mobile number for token generation
    // Send success message with token
    return res.status(200).json({ success: true, data: { mobile }, message: 'Login successful', token });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ success: false, error: 'Something went wrong' });
  }
});

// Dashboard route
app.post('/api/dashboard', (req, res) => {
  const { from, to } = req.body;

  // Perform search for packages based on the provided parameters
  // For demonstration purposes, let's assume we have some sample packages
  const packages = [
    { 
      destination: 'Goa', 
      from: 'Mumbai', 
      image: 'https://example.com/Goa.jpg', 
      title: 'Package 1', 
      description: '(3N/4D)',
      price: '₹7,500',
      points: [
        'Luxurious accommodation',
        'Complimentary breakfast',
        'Guided tours to famous landmarks',
        'Exciting water sports activities',
        'Evening entertainment events'
      ],
      priceComparison: 'This price is lower than the average price in April.',
      totalPrice: '₹7,500',
      perPersonPrice: '₹3,750',
      discountOffer: 'Extra Rs 5,898 off. Use Code CAPITALHUB'
    },
    // Add more packages as needed
  ];

  // Filter packages based on provided parameters
  const filteredPackages = packages.filter(package => package.destination === to && package.from === from);

  // If there are no packages found, return a message
  if (filteredPackages.length === 0) {
    return res.status(404).json({ success: false, message: 'No packages found for the given parameters' });
  }

  // Return the filtered packages as a response
  return res.status(200).json({ success: true, data: filteredPackages, message: 'Received package information successfully' });
});

// Define popular destinations data
const popularDestinations = [
  {
    name: 'Goa, India',
    image: 'https://example.com/Goa.jpg',
    price: '₹4,800',
    starRating: '4.8',
    description: 'Experience the pristine beaches and vibrant culture of Goa!'
  },
  {
    name: 'Great Wall of China',
    image:  'https://example.com/great_wall.jpg',
    price: 'Starting from ₹5,500',
    starRating: '5.0',
    description: 'Discover one of the most iconic wonders of the world, the Great Wall of China!'
  },
  {
    name: 'Manali, India',
    image:'https://example.com/manali.jpg',
    price: 'Starting from ₹6,000',
    starRating: '4.5',
    description: 'Escape to the serene beauty of Manali, nestled in the Himalayas!'
  }
];

// Popular destinations route
app.get('/api/popular-destinations', (req, res) => {
  try {
    return res.status(200).json({ success: true, data: popularDestinations, message: 'Popular destinations retrieved successfully' });
  } catch (error) {
    console.error('Error retrieving popular destinations:', error);
    return res.status(500).json({ success: false, error: 'Something went wrong' });
  }
});

// Get Contacts route
app.get('/api/contacts', async (req, res) => {
  try {
    // Fetch all contacts from the database
    const contacts = await Contact.find();
    return res.status(200).json({ success: true, data: contacts, message: 'Contacts retrieved successfully' });
  } catch (error) {
    console.error('Error retrieving contacts:', error);
    return res.status(500).json({ success: false, error: 'Something went wrong' });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
