const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const app = express();
app.use(express.json());

async function main() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/test', {
        });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}

main();

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

async function encryptPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const encryptedPassword = await encryptPassword(password);

        const newUser = new User({
            username,
            password: encryptedPassword
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            res.json({ message: 'Login successful' });
        } else {
            res.status(401).json({ message: 'Invalid password' });
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
