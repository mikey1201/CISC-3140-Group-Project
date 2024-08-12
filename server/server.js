const express = require('express');
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require('bcrypt');
const fs = require('fs');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const port = 3000;

// Fetch files from default directory
app.use(express.static(path.join(__dirname, '..')));

app.use(express.json());

// Start the database
mongoose.connect('mongodb://localhost:27017/data');

app.use(session({
    secret: 'cisc3140secretkey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

const db = mongoose.connection;

// User schema for database
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lists: {
        loveIt: [{ type: String }],
        okay: [{ type: String }],
        hatedIt: [{ type: String }]
    }
});

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    extract: { type: String }
});

const User = mongoose.model("User", userSchema);
const Movie = mongoose.model("Movie", movieSchema);

// Route to get all movies
app.get('/api/movies', async (req, res) => {
    try {
        const movies = await findAllMovies();
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Registration Route
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            password: hashedPassword,
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Login Route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log('Received login request for:', username);

        const user = await User.findOne({ username });
        if (!user) {
            console.log('No user found with username:', username);
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password mismatch for user:', username);
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        console.log('User authenticated successfully:', username);
        req.session.userId = user._id;

        // Redirect to the dashboard page after successful login
        res.status(200).json({ message: 'Login successful', redirectUrl: '/' });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Middleware to ensure the user is authenticated before accessing the dashboard
const authenticate = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    } else {
        return res.redirect('/'); // Redirect to the home page or another valid route
    }
};


// Example of a protected route
app.get('/api/protected-route', authenticate, (req, res) => {
    res.json({ message: 'You have access to this route' });
});

// Route to get user info
app.get('/api/user-info', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ username: user.username, createdAt: user.createdAt, lists: user.lists });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Route to replace the user's movie lists
app.post('/api/user/lists', authenticate, async (req, res) => {
    const { loveIt, okay, hatedIt } = req.body;

    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update only the lists that were provided
        if (loveIt) user.lists.loveIt = loveIt;
        if (okay) user.lists.okay = okay;
        if (hatedIt) user.lists.hatedIt = hatedIt;

        await user.save();
        res.status(200).json({ message: 'User lists updated successfully', lists: user.lists });
    } catch (error) {
        console.error('Error while updating lists:', error.message); // Log server-side errors
        res.status(500).json({ message: 'Server error while updating lists', error: error.message });
    }
});

// Logout Route
app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.json({ message: 'Logout successful' });
    });
});

// Start the server
app.listen(port, async () => {
    console.log(`Server running on http://localhost:${port}`);
    await loadMoviesIntoDatabase();
});

// Helper function to find all movies
async function findAllMovies() {
    try {
        return await Movie.find();
    } catch (error) {
        console.error('Error finding movies:', error.message);
        throw error;
    }
}

// Helper function to load movies into the database
async function loadMoviesIntoDatabase() {
    const filePath = path.join(__dirname, '..', 'data', 'movies.json');

    if (!fs.existsSync(filePath)) {
        console.log('movies.json file does not exist.');
        return;
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const movies = JSON.parse(fileContent);

    const movieCount = await Movie.countDocuments();
    if (movieCount > 0) {
        console.log('Movies are already loaded into the database.');
        return;
    }

    try {
        await Movie.insertMany(movies);
        console.log('Movies loaded into the database successfully.');
    } catch (error) {
        console.error('Error loading movies into the database:', error);
    }
}