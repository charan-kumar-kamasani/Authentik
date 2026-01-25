const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const connectDb = require("./config/db");
const User = require("./models/User");

dotenv.config();

const seedSuperAdmin = async () => {
    await connectDb();

    const email = "superadmin@example.com";
    const password = "password123";
    const mobile = "0000000000"; // Dummy mobile for schema validation if needed

    const userExists = await User.findOne({ email });

    if (userExists) {
        console.log("Super Admin already exists");
        process.exit();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
        email,
        password: hashedPassword,
        mobile,
        role: "superadmin"
    });

    console.log("Super Admin created: " + email + " / " + password);
    process.exit();
};

seedSuperAdmin();
