import User from "../models/User.js";

export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ message: "Query required" });

        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } },
            ],
        }).select("name email role _id");

        res.json(users);
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
