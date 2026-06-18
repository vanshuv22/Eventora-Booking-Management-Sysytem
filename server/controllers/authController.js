const User = require("../models/User");
const OTP = require("../models/OTP");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOTPEmail } = require("../utils/email");

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};
// Register User
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  let userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ error: "User already exixts" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      name,
      email,
      password: hashPassword,
      role: "user",
      action: "type",
      isVerified: false,
    });
    await user.save();
    // res.status(201).json({message: 'User registered successfully'});

  const otp = Math.floor(
  100000 + Math.random() * 900000
).toString();

console.log(`OTP for ${email}: ${otp}`);

await sendOTPEmail(
  email,
  otp,
  "account_verification"
);

res.status(201).json({
  message:
    "User registered successfully. Please check your email for OTP.",
  email: user.email,
  _id: user.id,
});
}


//Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  let user = await User.findOne({ email });
  if (!user) {
    return res
      .status(400)
      .json({ error: "Invalid credentials, Please Sign Up first" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  if (!user.isVerified && user.role === "user") {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.deleteMany({ email, action: "account_verification" }); // Remove old Otps
    await OTP.create({ email, otp, action: "account_verification" });
    await sendOTPEmail(email, otp, "account_verification");
    return res.status(400).json({
      error: "Account not verified. A new OTP has been sent to your email.",
    });
  }

  res.status(200).json({
    message: "Login successful",
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id, user.role),
  });
};

//Verify OTP
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  const otpRecord = await OTP.findOne({
    email,
    action: "account_verification",
  });

  if (!otpRecord) {
    return res.status(400).json({ error: "Invalid OTP" });
  }

  // expiry check
  if (otpRecord.createdAt.getTime() + 5 * 60 * 1000 < Date.now()) {
    await OTP.deleteMany({ email, action: "account_verification" });
    return res.status(400).json({ error: "OTP expired" });
  }

  // safe compare
  if (otpRecord.otp !== String(otp).trim()) {
    return res.status(400).json({ error: "Invalid OTP" });
  }

  const user = await User.findOneAndUpdate(
    { email },
    { isVerified: true },
    { new: true },
  );

  await OTP.deleteMany({ email, action: "account_verification" });

  return res.json({
    message: "Account verified successfully",
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id, user.role),
  });
};