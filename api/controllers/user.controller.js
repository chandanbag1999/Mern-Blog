import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import bcryptjs from "bcryptjs";
import { User } from "../models/user.model.js"



export const test = (req, res) => {
    res.json({meassage: "hello world"})
}

export const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if ([ username, email, password ].some((field) => field?.trim() === "")) {
        throw new ApiError("Please provide all required fields", 400);
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError("User with this username or email already exists", 400);
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password: hashedPassword,
    })

    const newUser = await User.findById(user._id).select("-password");

    if (!newUser) {
        throw new ApiError("Failed to create user", 500);
    }

    return res
    .status(201)
    .json(new ApiResponse(201, "User created successfully", newUser));
})