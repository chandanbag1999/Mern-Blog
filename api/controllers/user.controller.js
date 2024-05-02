import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import bcryptjs from "bcryptjs";
import { User } from "../models/user.model.js"
import jwt from "jsonwebtoken";
import { captureRejectionSymbol } from "events";



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

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if ([ email, password ].some((field) => field?.trim() === "")) {
        throw new ApiError("Please provide all required fields", 400);
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError("Invalid email or password", 401);
    }

    const isPasswordValid = bcryptjs.compareSync(password, user.password);

    if (!isPasswordValid) {
        throw new ApiError("Invalid password", 401);
    }

    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    )

    const loggedInUser = await User.findById(user._id).select("-password");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("access_token", token, options)
    .json(new ApiResponse(200, "User logged in successfully", loggedInUser));
})


export const google = asyncHandler(async (req, res) => {
    const { email, name, googlePhotoUrl } = req.body;
    const user = await User.findOne({ email });

    if (user) {
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        const loggedInUser = await User.findById(user._id).select("-password");

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
        .status(200)
        .cookie("access_token", token, options)
        .json(new ApiResponse(200, "User logged in successfully", loggedInUser));

    } else {
        const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

        const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);

        const newUser = await User.create({
            username: name.toLowerCase().split(" ").join("") + Math.random().toString(9).slice(-4),
            email,
            password: hashedPassword,
            profilePicture: googlePhotoUrl,
        });

        const token = jwt.sign(
            { id: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        const loggedInUser = await User.findById(newUser._id).select("-password");

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
        .status(200)
        .cookie("access_token", token, options)
        .json(new ApiResponse(200, "User logged in successfully", loggedInUser));
    };
});

export const updateUser = asyncHandler(async (req, res) => {
    if (req.user.id !== req.params.userId) {
        throw new ApiError(401, "You are not allowed to update this user");
    }

    if (req.body.password) {
        if (req.body.password.length < 6) {
            throw new ApiError(400, "Password must be at least 6 characters long");
        }
        req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    if (req.body.username) {
        if (req.body.username.length < 7 || req.body.username.length > 20) {
            throw new ApiError(400, "Username must be between 7 and 20 characters long");
        }
    }

    if (req.body.username.includes(" ")) {
        throw new ApiError(400, "Username cannot contain spaces");
    }

    if (req.body.username !== req.body.username.toLowerCase()) {
        throw new ApiError(400, "Username must be lowercase");
    }

    if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
        throw new ApiError(400, "Username can only contain letters and numbers");
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.params.userId,
        {
            $set: {
                username: req.body.username,
                email: req.body.email,
                profilePicture: req.body.profilePicture,
                password: req.body.password,
            },
        },
        { new: true },
    );

    const userWithoutPassword = await User.findById(updatedUser._id).select("-password");

    return res
    .status(200)
    .json(new ApiResponse(200, "User updated successfully", userWithoutPassword))
})


export const deleteUser = asyncHandler(async (req, res) => {
    if (req.user.id !== req.params.userId) {
        throw new ApiError(401, "You are not allowed to delete this user");
    }

    await User.findByIdAndDelete(req.params.userId);
    return res
    .status(200)
    .json(new ApiResponse(200, "User deleted successfully"))
});

export const signOut = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .clearCookie("access_token")
    .json(new ApiResponse(200, "User signed out successfully"))
});


s