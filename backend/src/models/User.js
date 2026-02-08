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
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand'
    },
    // companyId: new field - users (authorizer/creator/company accounts) may now be
    // linked to a Company. Keep brandId as the selected brand within the company.
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    }, // Hierarchy tracking
    name: { type: String },
    dob: { type: String },
    gender: { type: String },
    country: { type: String },
    state: { type: String },
    city: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
