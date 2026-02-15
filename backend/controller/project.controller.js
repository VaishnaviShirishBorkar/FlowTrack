import Project from '../models/Project.js';
import User from '../models/User.js';
import { logActivity } from './activity.controller.js';

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

        await Project.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
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

        res.status(200).json(updatedProject);
    } catch (error) {
        console.error("Error adding member:", error);
        res.status(500).json({ message: "Server error" });
    }
};
