import { Router } from "express";
import { google, loginUser, registerUser, test } from "../controllers/user.controller.js";


const router = Router();

router.route("/test").get(test)
router.route("/sign-up").post(registerUser)
router.route("/sign-in").post(loginUser)
router.route("/google").post(google)


export default router;