import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import jwt from "jsonwebtoken";
import { getAccessTokenCookieOptions, getRefreshTokenCookieOptions } from "../config/cookie-options.js";

const generateAccessAndRefreshToken = async(userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false});

    return { accessToken, refreshToken }
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access token");
  }
}

export const register = asyncHandler(async(req, res) => {
  const { companyName, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(400, "Email already registered");
  }

  const user = await User.create({ companyName, email, password });
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
  const registeredUser = await User.findById(user._id).select("-password -refreshToken");

  return res
    .status(200)
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions())
    .json(
      new ApiResponse(200, { user: registeredUser, accessToken, refreshToken }, "User registered Successfully")
    );
});

export const login = asyncHandler(async(req, res) => {
  const { email, password } = req.body;

  if(!email) throw new ApiError(400, "Email is required");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User does not exist");

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ApiError(401, "Invalid user credentials");

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  return res
    .status(200)
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions())
    .json(
      new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged In Successfully")
    );
});

export const logout = asyncHandler(async(req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } }, 
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken", getAccessTokenCookieOptions())
    .clearCookie("refreshToken", getRefreshTokenCookieOptions())
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export const refreshAccessToken = asyncHandler(async(req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken || req.header("Authorization")?.replace("Bearer ", "");

  if(!incomingRefreshToken) throw new ApiError(401, "Unauthorized request: No refresh token provided");

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select("+refreshToken");
  
    if(!user) throw new ApiError(401, "Invalid Refresh Token: User not found");
  
    if(incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or has been reused");
    }
  
    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);
  
    return res
      .status(200)
      .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
      .cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions())
      .json(
        new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed")
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

export const getCurrentUser = asyncHandler(async(req, res) => {
  if (!req.user) throw new ApiError(401, "Unauthorized request");

  const user = await User.findById(req.user._id).select("-password -refreshToken");
  if (!user) throw new ApiError(401, "User not found");

  return res.status(200).json(
    new ApiResponse(200, { user }, "User fetched successfully")
  );
});