const User = require("../models/UserModel");

const initializeDefaultAdmin = async () => {
    const defaultAdminUsername = 'admin@gmail.com';
    const defaultAdminPassword = 'admin123'; 

    const existingAdmin = await User.findOne({ username: defaultAdminUsername });

    if (!existingAdmin) {
        
        const admin = new User({
            username: defaultAdminUsername,
            password: defaultAdminPassword,
            role: "ADMIN",
            email: "admin@gmail.com"
        });

        await admin.save();
        console.log('Default admin user created');
    } else {
        console.log('Admin user already exists');
    }
};

module.exports = initializeDefaultAdmin;
