"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import api from "../app/lib/axios";
import { useRouter } from "next/navigation";

export default function SearchBar() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState({ projects: [], tasks: [] });
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    // Debounced search
    const debounceTimer = useRef(null);

    const handleSearch = useCallback(async (searchQuery) => {
        if (!searchQuery || searchQuery.trim().length < 2) {
            setResults({ projects: [], tasks: [] });
            setIsOpen(false);
            return;
        }

        setLoading(true);
        try {
            const res = await api.get(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setResults(res.data);
            setIsOpen(true);
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            handleSearch(value);
        }, 300);
    };

    // Ctrl+K shortcut
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                inputRef.current?.focus();
            }
            if (e.key === "Escape") {
                setIsOpen(false);
                inputRef.current?.blur();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleResultClick = (type, item) => {
        if (type === "project") {
            router.push(`/dashboard/project/${item._id}`);
        } else if (type === "task") {
            const projectId = item.project?._id || item.project;
            router.push(`/dashboard/project/${projectId}`);
        }
        setIsOpen(false);
        setQuery("");
    };

    const totalResults = results.projects.length + results.tasks.length;

    return (
        <div className="relative flex-1 max-w-md" ref={dropdownRef}>
            {/* Search Input */}
            <div className="relative">
                {/* Magnifying Glass Icon */}
                <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>

                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => { if (query.trim().length >= 2) setIsOpen(true); }}
                    placeholder="Search projects & tasks..."
                    className="w-full pl-10 pr-16 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />

                {/* Keyboard shortcut hint */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5">
                    <kbd className="text-[10px] text-gray-400 bg-gray-600 px-1.5 py-0.5 rounded font-mono">
                        Ctrl
                    </kbd>
                    <kbd className="text-[10px] text-gray-400 bg-gray-600 px-1.5 py-0.5 rounded font-mono">
                        K
                    </kbd>
                </div>
            </div>

            {/* Results Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                    {loading ? (
                        <div className="p-4 text-center text-gray-400 text-sm">
                            Searching...
                        </div>
                    ) : totalResults === 0 ? (
                        <div className="p-4 text-center text-gray-400 text-sm">
                            No results for &quot;{query}&quot;
                        </div>
                    ) : (
                        <div className="max-h-80 overflow-y-auto">
                            {/* Projects */}
                            {results.projects.length > 0 && (
                                <>
                                    <div className="px-3 py-2 text-xs text-gray-500 uppercase font-semibold bg-gray-800/80 sticky top-0">
                                        Projects
                                    </div>
                                    {results.projects.map((project) => (
                                        <div
                                            key={project._id}
                                            onClick={() => handleResultClick("project", project)}
                                            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-700 transition-colors"
                                        >
                                            <span className="text-lg">📁</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate">
                                                    {project.name}
                                                </p>
                                                {project.description && (
                                                    <p className="text-xs text-gray-400 truncate">
                                                        {project.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}

                            {/* Tasks */}
                            {results.tasks.length > 0 && (
                                <>
                                    <div className="px-3 py-2 text-xs text-gray-500 uppercase font-semibold bg-gray-800/80 sticky top-0">
                                        Tasks
                                    </div>
                                    {results.tasks.map((task) => (
                                        <div
                                            key={task._id}
                                            onClick={() => handleResultClick("task", task)}
                                            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-700 transition-colors"
                                        >
                                            <span className="text-lg">📝</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate">
                                                    {task.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {task.project?.name && (
                                                        <span className="text-xs text-gray-500">
                                                            {task.project.name}
                                                        </span>
                                                    )}
                                                    <span className={`text-xs px-1.5 py-0.5 rounded ${task.priority === "urgent" ? "bg-red-900/50 text-red-400" :
                                                            task.priority === "high" ? "bg-orange-900/50 text-orange-400" :
                                                                task.priority === "medium" ? "bg-blue-900/50 text-blue-400" :
                                                                    "bg-gray-700 text-gray-400"
                                                        }`}>
                                                        {task.priority}
                                                    </span>
                                                    {task.assignedTo && (
                                                        <span className="text-xs text-gray-500">
                                                            → {task.assignedTo.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
