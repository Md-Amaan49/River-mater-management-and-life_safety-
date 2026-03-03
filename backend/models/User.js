import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String },
  place: { type: String },
  state: { type: String },
  role: { type: String, default: "user" }, // user, admin, govt, dam_operator
  profileImage: { type: String },
  // ✅ saved dams for regular users
  savedDams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Dam" }],
  // ✅ dam operator specific fields
  assignedDam: { type: mongoose.Schema.Types.ObjectId, ref: "Dam" }, // for dam_operator role
  damVerified: { type: Boolean, default: false }, // whether dam assignment is verified
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
