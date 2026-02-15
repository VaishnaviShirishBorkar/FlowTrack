"use client";

import { useEffect, useState } from "react";
import api from "../../../lib/axios";
import { useAuth } from "../../../context/AuthContext";

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Edit state
    const [editName, setEditName] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get("/users/profile");
            setProfile(res.data);
            setEditName(res.data.name);
        } catch (error) {
            console.error("Failed to fetch profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });

        // Validate passwords match
        if (newPassword && newPassword !== confirmPassword) {
            setMessage({ type: "error", text: "New passwords do not match" });
            return;
        }

        if (newPassword && newPassword.length < 6) {
            setMessage({ type: "error", text: "Password must be at least 6 characters" });
            return;
        }

        setSaving(true);
        try {
            const payload = { name: editName };
            if (newPassword) {
                payload.currentPassword = currentPassword;
                payload.newPassword = newPassword;
            }

            const res = await api.put("/users/profile", payload);
            setProfile(res.data);

            // Update localStorage user data
            const storedUser = JSON.parse(localStorage.getItem("user"));
            if (storedUser) {
                storedUser.name = res.data.name;
                localStorage.setItem("user", JSON.stringify(storedUser));
            }

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setMessage({ type: "success", text: "Profile updated successfully!" });
        } catch (error) {
            setMessage({ type: "error", text: error.response?.data?.message || "Failed to update profile" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center py-20 text-gray-400">Loading profile...</div>;
    }

    const memberSince = profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        : "—";

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">My Profile</h1>

            {/* Profile Card */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                {/* Header with avatar */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-24 relative" />
                <div className="px-6 pb-6">
                    <div className="-mt-10 flex items-end gap-4 mb-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-gray-800 flex-shrink-0">
                            {profile?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="pb-1">
                            <h2 className="text-xl font-bold text-white">{profile?.name}</h2>
                            <p className="text-sm text-gray-400">{profile?.email}</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-white">{profile?.projectCount || 0}</div>
                            <div className="text-xs text-gray-400 mt-1">Projects</div>
                        </div>
                        <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-white">{profile?.taskCount || 0}</div>
                            <div className="text-xs text-gray-400 mt-1">Tasks Assigned</div>
                        </div>
                        <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-400">{profile?.completedTaskCount || 0}</div>
                            <div className="text-xs text-gray-400 mt-1">Completed</div>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 text-gray-300">
                            <span className="text-gray-500 w-24 flex-shrink-0">Role</span>
                            <span className="px-2 py-0.5 bg-blue-900/40 text-blue-400 rounded text-xs font-medium capitalize">
                                {profile?.role?.replace('_', ' ')}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300">
                            <span className="text-gray-500 w-24 flex-shrink-0">Email</span>
                            <span>{profile?.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300">
                            <span className="text-gray-500 w-24 flex-shrink-0">Joined</span>
                            <span>{memberSince}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Form */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Edit Profile</h3>

                {message.text && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === "success"
                            ? "bg-green-900/30 text-green-400 border border-green-900/40"
                            : "bg-red-900/30 text-red-400 border border-red-900/40"
                        }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1.5">Name</label>
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition"
                            required
                        />
                    </div>

                    <div className="border-t border-gray-700 pt-4 mt-4">
                        <h4 className="text-sm font-medium text-gray-300 mb-3">Change Password</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Current Password</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition"
                                    placeholder="Leave blank to keep current"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition"
                                        placeholder="Min 6 characters"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition"
                                        placeholder="Repeat new password"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg transition text-sm font-medium"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Danger Zone */}
            <div className="bg-gray-800 rounded-xl border border-red-900/40 p-6">
                <h3 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h3>
                <p className="text-sm text-gray-400 mb-4">Sign out of your account.</p>
                <button
                    onClick={logout}
                    className="bg-red-900/30 hover:bg-red-900/60 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg transition text-sm border border-red-900/40"
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
}
