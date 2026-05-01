const express     = require('express');
const Project     = require('../models/Project');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ admin: req.user._id }, { members: req.user._id }],
    })
      .populate('admin', 'name email')
      .populate('members', 'name email');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  const { name, description } = req.body;
  try {
    const project = await Project.create({
      name, description, admin: req.user._id, members: [],
    });
    await project.populate('admin', 'name email');
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('admin', 'name email')
      .populate('members', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const hasAccess =
      project.admin._id.equals(req.user._id) ||
      project.members.some((m) => m._id.equals(req.user._id));
    if (!hasAccess) return res.status(403).json({ message: 'Access denied' });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/members', async (req, res) => {
  const { userId } = req.body;
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!project.admin.equals(req.user._id))
      return res.status(403).json({ message: 'Only admin can add members' });
    if (project.members.includes(userId))
      return res.status(400).json({ message: 'User already a member' });

    project.members.push(userId);
    await project.save();
    await project.populate('members', 'name email');
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id/members/:userId', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!project.admin.equals(req.user._id))
      return res.status(403).json({ message: 'Only admin can remove members' });

    project.members = project.members.filter(
      (m) => m.toString() !== req.params.userId
    );
    await project.save();
    res.json({ message: 'Member removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!project.admin.equals(req.user._id))
      return res.status(403).json({ message: 'Only admin can delete project' });

    await project.deleteOne();
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;