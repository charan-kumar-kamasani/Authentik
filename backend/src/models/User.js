const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    mobile: { type: String, unique: true }, // For regular users
    email: { type: String, unique: true, sparse: true }, // For Admins
    password: { type: String }, // For Admins (hashed)
    role: {
      type: String,
      enum: ["superadmin", "admin", "manager", "user", "company", "authorizer", "creator"],
      default: "user",
    },
    companyId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    }, // Hierarchy tracking
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
