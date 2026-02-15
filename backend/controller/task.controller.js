import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { logActivity } from './activity.controller.js';

export const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;

        let projects;
        if (role === 'Admin') {
            projects = await Project.find({}, '_id');
        } else {
            projects = await Project.find({
                $or: [{ owner: userId }, { members: userId }]
            }, '_id');
        }

        const projectIds = projects.map(p => p._id);

        const tasks = await Task.find({ project: { $in: projectIds } });

        const stats = {
            totalTasks: tasks.length,
            byPriority: {
                urgent: tasks.filter(t => t.priority === 'urgent').length,
                high: tasks.filter(t => t.priority === 'high').length,
                medium: tasks.filter(t => t.priority === 'medium').length,
                low: tasks.filter(t => t.priority === 'low').length,
            },
            byStatus: {
                todo: tasks.filter(t => t.status === 'todo').length,
                in_progress: tasks.filter(t => t.status === 'in_progress').length,
                review: tasks.filter(t => t.status === 'review').length,
                done: tasks.filter(t => t.status === 'done').length,
            }
        };

        // Also return recent tasks assigned to user
        const myTasks = await Task.find({ assignedTo: userId })
            .sort({ dueDate: 1 })
            .limit(5)
            .populate('project', 'name');

        res.json({ stats, myTasks });

    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const createTask = async (req, res) => {
    try {
        const { title, description, projectId, priority, dueDate, assignedTo } = req.body;

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: "Project not found" });

        // Check if user is member or owner
        const isMember = project.members.some(m => m.equals(req.user._id));
        const isOwner = project.owner.equals(req.user._id);

        if (!isMember && !isOwner && req.user.role !== 'Admin') {
            return res.status(403).json({ message: "Access denied" });
        }

        const task = new Task({
            title,
            description,
            project: projectId,
            priority,
            dueDate,
            assignedTo,
            status: 'todo' // Default status
        });

        await task.save();

        // Log activity
        const io = req.app.get('io');
        await logActivity(io, {
            action: 'created_task',
            userId: req.user._id,
            userName: req.user.name,
            projectId,
            details: `${req.user.name} created task "${title}"`
        });

        res.status(201).json(task);
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getTasks = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: "Project not found" });

        // Check authentication
        const isMember = project.members.some(m => m.equals(req.user._id));
        const isOwner = project.owner.equals(req.user._id);

        if (!isMember && !isOwner && req.user.role !== 'Admin') {
            return res.status(403).json({ message: "Access denied" });
        }

        const tasks = await Task.find({ project: projectId })
            .populate('assignedTo', 'name email')
            .populate('project', 'name');

        res.status(200).json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const updates = req.body;

        const task = await Task.findById(taskId).populate('project');
        if (!task) return res.status(404).json({ message: "Task not found" });

        // Check permissions
        const project = task.project;
        if (!project) return res.status(404).json({ message: "Project context missing" });

        const isMember = project.members.some(m => m.equals(req.user._id));
        const isOwner = project.owner.equals(req.user._id);

        if (!isMember && !isOwner && req.user.role !== 'Admin') {
            return res.status(403).json({ message: "Access denied" });
        }

        const oldStatus = task.status;
        const updatedTask = await Task.findByIdAndUpdate(taskId, updates, { new: true })
            .populate('assignedTo', 'name email');

        // Log activity for status changes
        const io = req.app.get('io');
        const projectId = project._id;

        if (updates.status && updates.status !== oldStatus) {
            const statusNames = {
                todo: 'To Do',
                in_progress: 'In Progress',
                review: 'Under Review',
                done: 'Completed'
            };
            await logActivity(io, {
                action: 'moved_task',
                userId: req.user._id,
                userName: req.user.name,
                projectId,
                details: `${req.user.name} moved "${task.title}" from ${statusNames[oldStatus] || oldStatus} to ${statusNames[updates.status] || updates.status}`
            });
        } else {
            await logActivity(io, {
                action: 'updated_task',
                userId: req.user._id,
                userName: req.user.name,
                projectId,
                details: `${req.user.name} updated task "${task.title}"`
            });
        }

        res.status(200).json(updatedTask);
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const task = await Task.findById(taskId).populate('project');
        if (!task) return res.status(404).json({ message: "Task not found" });

        const project = task.project;
        const isOwner = project.owner.equals(req.user._id);

        if (!isOwner && req.user.role !== 'Admin') {
            return res.status(403).json({ message: "Only project owner/admin can delete tasks" });
        }

        const io = req.app.get('io');
        await logActivity(io, {
            action: 'deleted_task',
            userId: req.user._id,
            userName: req.user.name,
            projectId: project._id,
            details: `${req.user.name} deleted task "${task.title}"`
        });

        await Task.findByIdAndDelete(taskId);
        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
