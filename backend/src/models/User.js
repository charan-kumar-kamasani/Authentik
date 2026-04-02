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
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },

    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand'
    },
    // New: allow assigning multiple brands to a single user
    brandIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
    }],
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
    ageGroup: { type: String },
    dob: { type: String },
    gender: { type: String },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    profileImage: { type: String, default: null }, // URL stored from Cloudinary
  },
  { timestamps: true }
);

// Performance Indexes
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ brandId: 1 });
userSchema.index({ companyId: 1 });
userSchema.index({ createdBy: 1 });

module.exports = mongoose.model("User", userSchema);
