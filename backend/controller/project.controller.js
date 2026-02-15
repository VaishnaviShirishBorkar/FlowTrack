import Project from '../models/Project.js';
import User from '../models/User.js';
import { logActivity } from './activity.controller.js';
import { createNotification } from './notification.controller.js';

export const createProject = async (req, res) => {
    try {
        const { name, description, startDate, endDate } = req.body;

        const project = new Project({
            name,
            description,
            startDate,
            endDate,
            owner: req.user._id,
            members: [req.user._id] // Owner is automatically a member
        });

        await project.save();
        res.status(201).json(project);
    } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ message: "Server error while creating project" });
    }
};

export const getProjects = async (req, res) => {
    try {
        // Find projects where user is owner OR member
        const projects = await Project.find({
            $or: [
                { owner: req.user._id },
                { members: req.user._id }
            ]
        })
            .populate('owner', 'name email')
            .populate('members', 'name email');

        res.status(200).json(projects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ message: "Server error while fetching projects" });
    }
};

export const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('owner', 'name email')
            .populate('members', 'name email');

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Check if user has access
        const isMember = project.members.some(member => member._id.equals(req.user._id));
        const isOwner = project.owner._id.equals(req.user._id);

        if (!isMember && !isOwner && req.user.role !== 'Admin') {
            return res.status(403).json({ message: "Access denied" });
        }

        res.status(200).json(project);
    } catch (error) {
        console.error("Error fetching project:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: "Project not found" });

        if (!project.owner.equals(req.user._id) && req.user.role !== 'Admin') {
            return res.status(403).json({ message: "Only owner can update project" });
        }

        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.status(200).json(updatedProject);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: "Project not found" });

        if (!project.owner.equals(req.user._id) && req.user.role !== 'Admin') {
            return res.status(403).json({ message: "Only owner can delete project" });
        }

        // Import models for cascade delete
        const Task = (await import('../models/Task.js')).default;
        const Comment = (await import('../models/Comment.js')).default;
        const Activity = (await import('../models/Activity.js')).default;
        const Notification = (await import('../models/Notification.js')).default;

        // Get all tasks in this project to delete their comments too
        const projectTasks = await Task.find({ project: req.params.id }, '_id');
        const taskIds = projectTasks.map(t => t._id);

        // Cascade delete all associated data
        if (taskIds.length > 0) {
            await Comment.deleteMany({ task: { $in: taskIds } });
        }
        await Task.deleteMany({ project: req.params.id });
        await Activity.deleteMany({ project: req.params.id });
        await Notification.deleteMany({ project: req.params.id });

        await Project.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).json({ message: "Server error" });
    }
};


export const addMember = async (req, res) => {
    try {
        console.log('req.body ', req.body);
        const { userId } = req.body;
        const project = await Project.findById(req.params.id);
        console.log('project ', project);
        console.log('userid ', userId);


        if (!project) return res.status(404).json({ message: "Project not found" });

        if (!project.owner.equals(req.user._id) && req.user.role !== 'Admin' && req.user.role !== 'Team Leader') {
            return res.status(403).json({ message: "Only owner, Admin, or Team Leader can add members" });
        }

        const alreadyMember = project.members.some(
            member => member.toString() === userId
        );

        if (alreadyMember) {
            return res.status(400).json({ message: "User is already a member" });
        }

        project.members.push(userId);
        await project.save();

        const updatedProject = await Project.findById(req.params.id)
            .populate('members', 'name email role');

        // Log activity
        const addedUser = await User.findById(userId).select('name');
        console.log('addedUser ', addedUser);
        const io = req.app.get('io');
        await logActivity(io, {
            action: 'added_member',
            userId: req.user._id,
            userName: req.user.name,
            projectId: req.params.id,
            details: `${req.user.name} added ${addedUser?.name || 'a user'} to the project`
        });

        // Notify the added user
        await createNotification(io, {
            recipientId: userId,
            type: 'member_added',
            title: 'Added to Project',
            message: `${req.user.name} added you to project "${project.name}"`,
            projectId: req.params.id
        });

        res.status(200).json(updatedProject);
    } catch (error) {
        console.error("Error adding member:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const removeMember = async (req, res) => {
    try {
        const { userId } = req.body;
        const project = await Project.findById(req.params.id);

        if (!project) return res.status(404).json({ message: "Project not found" });

        // Only owner, Admin, or Team Leader can remove members
        if (!project.owner.equals(req.user._id) && req.user.role !== 'Admin' && req.user.role !== 'Team Leader') {
            return res.status(403).json({ message: "Only owner, Admin, or Team Leader can remove members" });
        }

        // Cannot remove the project owner
        if (project.owner.toString() === userId) {
            return res.status(400).json({ message: "Cannot remove the project owner" });
        }

        const isMember = project.members.some(m => m.toString() === userId);
        if (!isMember) {
            return res.status(400).json({ message: "User is not a member of this project" });
        }

        project.members = project.members.filter(m => m.toString() !== userId);
        await project.save();

        const updatedProject = await Project.findById(req.params.id)
            .populate('members', 'name email role');

        // Log activity
        const removedUser = await User.findById(userId).select('name');
        const io = req.app.get('io');
        await logActivity(io, {
            action: 'added_member',
            userId: req.user._id,
            userName: req.user.name,
            projectId: req.params.id,
            details: `${req.user.name} removed ${removedUser?.name || 'a user'} from the project`
        });

        res.status(200).json(updatedProject);
    } catch (error) {
        console.error("Error removing member:", error);
        res.status(500).json({ message: "Server error" });
    }
};
