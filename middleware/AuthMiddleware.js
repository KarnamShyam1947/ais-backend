const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const verifyToken = (req, res, next) => {
    
    const token = req.cookies.authToken;

    if (!token) {
        return res.status(403).json({ error: 'Access denied. No token provided.' });
    }

    try {
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next();  
    } catch (err) {
        return res.status(400).json({ error: 'Invalid token' });
    }
};

module.exports = verifyToken;
