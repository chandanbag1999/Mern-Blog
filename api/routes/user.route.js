import { Router } from "express";
import { google, loginUser, registerUser, test, updateUser } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/verifyUser.js";


const router = Router();

router.route("/test").get(test)
router.route("/sign-up").post(registerUser)
router.route("/sign-in").post(loginUser)
router.route("/google").post(google)
router.route("/update/:userId").put(verifyToken, updateUser);


export default router;