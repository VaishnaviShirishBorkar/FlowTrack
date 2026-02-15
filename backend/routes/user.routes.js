import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { searchUsers } from "../controller/user.controller.js";

const router = express.Router();

router.get("/search", verifyToken, searchUsers);

export default router;
