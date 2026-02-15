"use client";

import { useState } from "react";
import api from "../../lib/axios";

export default function AddMemberModal({ isOpen, onClose, projectId, onMemberAdded }) {
    const [query, setQuery] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const searchUsers = async () => {
        if (!query) return;
        setLoading(true);
        try {
            const res = await api.get(`/users/search?query=${query}`);
            setUsers(res.data);
            console.log('users addmembermodal ', res.data);

        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setLoading(false);
        }
    };

    const addMember = async (userId) => {
        try {
            await api.post(`/projects/${projectId}/members`, { userId });
            onMemberAdded();
            onClose();
        } catch (error) {
            console.error("Failed to add member", error);
            alert("Failed to add member"); // Simple alert for now
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Add Member</h2>
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by name or email"
                        className="flex-1 bg-gray-700 rounded px-4 py-2 text-white"
                    />
                    <button onClick={searchUsers} className="bg-blue-600 px-4 py-2 rounded text-white">Search</button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {users.map(user => (
                        <div key={user._id} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                            <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-xs text-gray-400">{user.email}</p>
                            </div>
                            <button
                                onClick={() => addMember(user._id)}
                                className="bg-green-600 px-3 py-1 rounded text-sm text-white hover:bg-green-700"
                            >
                                Add
                            </button>
                        </div>
                    ))}
                    {users.length === 0 && !loading && <p className="text-gray-400 text-center text-sm">No users found</p>}
                </div>

                <button onClick={onClose} className="mt-4 w-full text-gray-400 hover:text-white">Cancel</button>
            </div>
        </div>
    );
}
