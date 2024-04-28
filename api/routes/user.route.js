import { Router } from "express";
import { registerUser, test } from "../controllers/user.controller.js";


const router = Router();

router.route("/test").get(test)
router.route("/sign-up").post(registerUser)


export default router;