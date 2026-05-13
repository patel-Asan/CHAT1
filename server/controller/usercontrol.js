import User from "../model/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/util.js"; // Make sure this exists
import cloudinary from "../lib/cloudinary.js"; // Import cloudinary for image uploads

// Signup a new user
export const signup = async (req, res) => {
  const { fullName, email, password, bio } = req.body;

  try {
    // 1. Check for missing details
    if (!fullName || !email || !password) {
      return res.json({ success: false, message: "Missing details" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // 2. Check if the user already exists
    if (user) {
      return res.json({ success: false, message: "Account already exists" });
    }

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    // 4. Create the new user
    const newUser = await User.create({
      fullName,
      email: normalizedEmail,
      password: hashedPass,
      bio: bio || "",
    });

    // 5. Generate a token (exclude password from response)
    const token = generateToken(newUser._id);
    const userData = await User.findById(newUser._id).select("-password");

    res.json({
      success: true,
      message: "User created successfully",
      token,
      userData
    });

  } catch (error) {
     res.json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
};


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email.toLowerCase().trim();
        const userData = await User.findOne({ email: normalizedEmail })

        if (!userData) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        const ispasswordCorrect = await bcrypt.compare(password, userData.password);

        if (!ispasswordCorrect) {
            return res.json({
                success: false,
                message: "Invalid credentials"
            });
        }
        const token = generateToken(userData._id)
        const user = await User.findById(userData._id).select("-password");

        return res.json({
            success: true,
            message: "User logged in successfully",
            token,
            userData: user
        });
    } catch (error) {
        return res.json({
            success: false, 
            message: "Error logging in",
            error: error.message,
        });
    }
}   


export const CheckAuth = async (req, res) => {
    res.json({
        success: true,
        message: "User is authenticated",
        user: req.user
    });
}


export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body;

        const userId = req.user._id;
        let updateuser;

        if(!profilePic){
            updateuser = await User.findByIdAndUpdate(userId, {
                bio,
                fullName
            }, { new: true });  
        } else {
            const upload = await cloudinary.uploader.upload(profilePic, {
              quality: "auto", fetch_format: "auto", width: 400, height: 400, crop: "limit",
            });

            updateuser = await User.findByIdAndUpdate(userId, {
                profilePic: upload.secure_url,
                bio,
                fullName
            }, { new: true });
        }       
        res.json({
            success: true,
            message: "Profile updated successfully",
            user: updateuser
        });
    } catch (error) {
        res.json({
            success: false,
            message: "Error updating profile",
            error: error.message,
        });
    }
}
