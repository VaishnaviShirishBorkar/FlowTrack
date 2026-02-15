"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import api from "../lib/axios";
import { usePathname } from "next/navigation";

export default function Sidebar() {
    const { user, logout } = useAuth();
    const [projects, setProjects] = useState([]);
    const pathname = usePathname();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await api.get("/projects");
                setProjects(res.data);
            } catch (error) {
                console.error("Error fetching projects:", error);
            }
        };
        if (user) {
            fetchProjects();
        }
    }, [user]);

    const isActive = (path) => pathname === path;

    return (
        <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col justify-between h-full">
            <div className="p-4">
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">
                        F
                    </div>
                    <span className="text-xl font-bold">FlowTrack</span>
                </div>

                <nav className="flex flex-col gap-2">
                    <Link
                        href="/dashboard"
                        className={`p-2 rounded-lg flex items-center gap-3 transition-colors ${isActive('/dashboard') ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                    >
                        <span>🏠</span> Home
                    </Link>

                    {/* Role specific links could go here if needed, but requirements mention Timeline/Search etc which seem general */}
                    <div className="my-4 border-t border-gray-700"></div>

                    <div className="text-xs uppercase text-gray-500 font-semibold mb-2 px-2">Projects</div>
                    <div className="flex flex-col gap-1">
                        {projects.map(project => (
                            <Link
                                key={project._id}
                                href={`/dashboard/project/${project._id}`}
                                className={`p-2 rounded-lg text-sm flex items-center gap-3 transition-colors ${isActive(`/dashboard/project/${project._id}`) ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                            >
                                <span>📁</span> {project.name}
                            </Link>
                        ))}
                    </div>
                </nav>
            </div>

            <div className="p-4 border-t border-gray-700">
                <div className="mb-4 px-2">
                    <div className="text-sm font-medium text-white">{user?.name}</div>
                    <div className="text-xs text-gray-400 capitalize">{user?.role?.replace('_', ' ')}</div>
                </div>
                <button
                    onClick={logout}
                    className="w-full p-2 text-left text-red-400 hover:bg-gray-700 rounded-lg transition-colors text-sm flex items-center gap-2"
                >
                    <span>🚪</span> Sign out
                </button>
            </div>
        </aside>
    );
}
