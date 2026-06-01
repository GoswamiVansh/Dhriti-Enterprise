import type { Request, Response } from "express";
import User from "../models/User.model.js";
import generateToken from "../utils/generateToken.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  AppError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/AppError.js";

/** POST /api/v1/auth/register */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new AppError("User already exists with this email", 400);
  }

  const user = await User.create({ name, email, password, phone });

  const token = generateToken(res, user._id.toString(), user.role);

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token,
    },
  });
});

/** POST /api/v1/auth/login */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const token = generateToken(res, user._id.toString(), user.role);

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token,
    },
  });
});

/** POST /api/v1/auth/logout */
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  const isDev = process.env.NODE_ENV !== "production";

  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
    secure: !isDev,
    sameSite: isDev ? "lax" : "none",
  });

  res.json({ success: true, message: "Logged out successfully" });
});

/** GET /api/v1/auth/profile */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new NotFoundError("User");
  }

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      addresses: user.addresses,
      wishlist: user.wishlist,
      createdAt: user.createdAt,
    },
  });
});

/** PUT /api/v1/auth/profile */
export const updateProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await User.findById(req.user?._id);

    if (!user) {
      throw new NotFoundError("User");
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.addresses) user.addresses = req.body.addresses;
    if (req.body.avatar) user.avatar = req.body.avatar;

    const updatedUser = await user.save();
    const token = generateToken(
      res,
      updatedUser._id.toString(),
      updatedUser.role
    );

    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        addresses: updatedUser.addresses,
        token,
      },
    });
  }
);

/** PUT /api/v1/auth/change-password */
export const changePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id).select("+password");
    if (!user) {
      throw new NotFoundError("User");
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      throw new AppError("Current password is incorrect", 400);
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  }
);
