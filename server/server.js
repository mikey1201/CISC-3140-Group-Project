const express = require('express');
const mongoose = require("mongoose");
const path = require("path");
const e = require("express");
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

//fetch files from default directory
app.use(express.static(path.join(__dirname, '..')));
app.use(express.json());
//start the database
mongoose.connect('mongodb://localhost:27017/data');

const db = mongoose.connection;

//user schema for database
const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true, trim: true,},
    password: {type: String, required: true,},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});
const movieSchema = new mongoose.Schema({
   title: {type: String, required: true}
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
        // Check if the username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
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
        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const authenticate = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    } else {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};
app.get('/api/protected-route', authenticate, (req, res) => {
    res.json({ message: 'You have access to this route' });
});

const bodyParser = require('body-parser');
const session = require('express-session');

app.use(bodyParser.json());
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

//start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

async function findAllMovies(){
    try {
        return await Movie.find();
    } catch (error) {
        console.error(error.message);
    }
}