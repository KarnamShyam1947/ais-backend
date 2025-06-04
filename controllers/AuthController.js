const User = require("./../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await User.findOne({ username });

    if (!user) {
        return res.status(400).json({ error: 'Invalid username or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(400).json({ error: 'Invalid username or password' });
    }


    const token = jwt.sign(
        {
            id: user._id,
            username: user.username
        },
        process.env.JWT_SECRET,
        { expiresIn: '6h' }
    );


    res.cookie('authToken', token, { httpOnly: true, secure: false, maxAge: 3600000 });
    res.json({ message: 'Logged in successfully' });

};

const verifyUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); // Don't return password
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
}

const logout = (req, res) => {
    res.cookie('authToken', '', {
        httpOnly: true,
        secure: false,
        maxAge: 0, 
    });
    res.status(200).json({ message: 'Logged out successfully' });
}

const registerUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password || !role) {
            return res.status(400).json({ error: 'Send all required details with the request' });
        }

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(409).json({ error: 'Username or email already in use' });
        }

        const newUser = new User({ username, email, password, role });

        await newUser.save();

        const userResponse = {
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role
        };

        return res.status(201).json({ message: 'User registered successfully', user: userResponse });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error during registration' });
    }
};


const changePassword = async (req, res) => {
    const { currentPassword, newPassword, reEnterPassword } = req.body;


    if (!currentPassword || !newPassword || !reEnterPassword) {
        return res.status(400).json({ error: 'Current password, new password, and re-entered password are required' });
    }


    if (newPassword !== reEnterPassword) {
        return res.status(400).json({ error: 'New password and re-entered password must match' });
    }

    try {

        const user = await User.findById(req.user.id);


        const isMatch = await user.isPasswordMatch(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error changing password', error });
    }
};


module.exports = {
    login,
    logout,
    verifyUser,
    registerUser,
    changePassword
}
