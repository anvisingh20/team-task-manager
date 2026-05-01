const express     = require('express');
const Task        = require('../models/Task');
const Project     = require('../models/Project');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { project: projectId } : {};
    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  const { title, description, dueDate, priority, projectId, assignedTo } = req.body;
  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!project.admin.equals(req.user._id))
      return res.status(403).json({ message: 'Only admin can create tasks' });

    const task = await Task.create({
      title, description, dueDate, priority,
      project: projectId,
      createdBy: req.user._id,
      assignedTo: assignedTo || null,
    });
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const isAdmin    = task.project.admin.equals(req.user._id);
    const isAssigned = task.assignedTo && task.assignedTo.equals(req.user._id);

    if (!isAdmin && !isAssigned)
      return res.status(403).json({ message: 'Not authorized to update this task' });

    if (isAdmin) {
      Object.assign(task, req.body);
    } else {
      task.status = req.body.status;
    }

    const updated = await task.save();
    await updated.populate('assignedTo', 'name email');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (!task.project.admin.equals(req.user._id))
      return res.status(403).json({ message: 'Only admin can delete tasks' });

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;