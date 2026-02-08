const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const connectDb = require("./config/db");
const User = require("./models/User");

dotenv.config();

const users = [
    {
        name: "Super Admin",
        email: "superadmin@example.com",
        password: "password123",
        role: "superadmin",
        companyId: null
    },
    {
        name: "Admin User",
        email: "admin@example.com",
        password: "password123",
        role: "admin",
        companyId: null
    },
    {
        name: "Company Owner",
        email: "company@example.com",
        password: "password123",
        role: "company",
        companyId: null // Will be their own ID effectively
    }
];

const seedAll = async () => {
    try {
        await connectDb();
        
        console.log("Clearing Users...");
        await User.deleteMany({});

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("password123", salt);

        console.log("Creating Users...");

        // 1. Create Super Admin
        await User.create({
            name: "Super Admin",
            email: "superadmin@example.com",
            password: hashedPassword,
            role: "superadmin"
        });

        // 2. Create Admin
        await User.create({
            name: "Admin User",
            email: "admin@example.com",
            password: hashedPassword,
            role: "admin"
        });

        // 3. Create Company
        const companyUser = await User.create({
            name: "Tech Corp",
            email: "company@example.com",
            password: hashedPassword,
            role: "company"
        });

        // 4. Create Authorizer (linked to Company)
        await User.create({
            name: "Auth Manager",
            email: "authorizer@example.com",
            password: hashedPassword,
            role: "authorizer",
            companyId: companyUser._id
        });

        // 5. Create Creator (linked to Company)
        await User.create({
            name: "Creator Staff",
            email: "creator@example.com",
            password: hashedPassword,
            role: "creator",
            companyId: companyUser._id
        });

        console.log("\n--- SEED COMPLETE ---");
        console.log("Super Admin: superadmin@example.com / password123");
        console.log("Admin:       admin@example.com      / password123");
        console.log("Company:     company@example.com    / password123");
        console.log("Authorizer:  authorizer@example.com / password123");
        console.log("Creator:     creator@example.com    / password123");
        console.log("---------------------\n");

        process.exit();
    } catch (error) {
        console.error("Seed Error:", error);
        process.exit(1);
    }
};

seedAll();
