import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/User.schema.js";
import { hashpassword, comparedPassword } from '../utils/hashpassword.utility.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiError } from "../utils/errorHadler.js";



const registerUser = asyncHandler(async (req, res) => {

  const { username, email, password } = req.body;


  if ([username, email, password].some((list) => list?.trim() === "")) {

    return res.status(400).json({ msg: ' please provided all fields ' })
  }

  const hashedpassword = await hashpassword(password);

  if (!hashedpassword) {
    return res.status(400).json({ msg: ' cannot hash user password ' })
  }

  const existinguser = await User.findOne({ $or: [{ username }, { email }] });

  if (existinguser) {
    return res.status(400).json({ msg: ' User  already Exists' })

  }
  const avatarLocalPath = req.files?.avatar?.[0]?.path;

  let coverImageLocalPath;

  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path
  }


  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!avatar) {
    throw new ApiError(500, "Failed to upload avatar to Cloudinary")
  }

  const user = await User.create({
    username: username,
    email: email,
    avatar: avatar,
    coverImage: coverImage || "",
    password: hashedpassword

  })

  if (!user) {
    return res.status(400).json({ msg: ' error occur in creating User ' })

  } else {
    res.status(200).json({ msg: '  User Created Successfuly ' })

  }

})

const loginUser = asyncHandler(async (req, res) => {

  const { username, password } = req.body;

  if ([username, password].some((list) => list?.trim() === "")) {
    return res.status(401).json({ msg: 'please provided username and password ' })
  }
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(401).json({ msg: '  User not found in dataBase' })

  }

  const accessToken = user.genrateAccessToken();
  const refreshToken = user.genrateRefreshToken();

  user.refreshToken = refreshToken;

  const comparedpassword = await comparedPassword(password, user.password);

  if (!comparedpassword) {
    return res.status(400).json({ msg: ' Wrong password ' })
  }

  await user.save({ validateBeforeSave: false });
  return res.status(200).json({ accessToken, refreshToken, user: { username: req.cookies } })

})

const logoutUser = asyncHandler(async (req, res) => {

  await User.findByIdAndUpdate(req.user._id, {
    $unset: {
      refreshToken: ""
    }
  }, {
    new: true
  })
  return res.status(200).json({ msg: " User logged out successfully" });
})

const refreshTokengenration = asyncHandler((req, res) => {
  const token = req.cookies.refreshToken;
})


const changePassword = asyncHandler((req, res) => {
  const { oldPassword, newPassword } = req.body;


})

export { registerUser, loginUser, logoutUser, refreshTokengenration }

