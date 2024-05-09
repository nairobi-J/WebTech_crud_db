const express = require('express');
const router = express.Router();
const dbConnection = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/tokenAndAdminHandler');

router.get('/getTask', verifyToken, async (req, res) => {
    try {
        const userId = req.email;
        const query = 'SELECT * FROM tasks WHERE user_id = ?';
        dbConnection.query(query, userId, (error, result) => {
            if (error) res.status(500).json("Failed");
            res.status(200).json({
                message: "Successfully get task",
                task: result
            })
        })
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Error fetching tasks' });
    }
});


router.get('/getAllTask', verifyToken, async (req, res) => {
    try {
        const userRole = req.role;
        if (req.role === "admin") {
            const userId = req.email;
            const query = 'SELECT * FROM tasks';
            dbConnection.query(query, (error, result) => {
                if (error) res.status(500).json("Failed");
                res.status(200).json({
                    message: "Successfully get task",
                    task: result
                })
            })
        } else res.status(404).json("You are not an admin");

    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Error fetching tasks' });
    }
});


router.post('/addTask', verifyToken, async (req, res) => {
    try {
        const userId = req.email;
        const { title, description, status } = req.body;
        const query = 'INSERT INTO tasks (title, description, status, user_id) VALUES (?, ?, ?, ?)';
        await dbConnection.query(query, [title, description, status, userId]);

        res.status(201).json({ message: 'Task created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error creating task' });
    }
});


router.put('/updateTask/:id', verifyToken, async (req, res) => {
    try {
        const userId = req.email; // Retrieve user ID from the authenticated user
        const taskId = req.params.id;

        const query = 'UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ? AND user_id = ?';
        const values = [
            req.body.title,
            req.body.description,
            req.body.status,
            taskId,
            userId
        ]

        dbConnection.query(query, values, (error, result) => {
            if (error) res.status(500).json("Failed");
            res.status(200).json({
                message: "Successfully Updated"
            })
        })

    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Error updating task' });
    }
});

router.delete('/tasks/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const taskId = req.params.id;
        const query = 'DELETE FROM tasks WHERE id = ?';
        await dbConnection.query(query, [taskId]);
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Error deleting task' });
    }
});


router.delete('/deleteTask/:id', verifyToken, async (req, res) => {
    try {
        const userId = req.email;
        const taskId = req.params.id;
        const query = 'DELETE FROM tasks WHERE id = ? AND user_id = ?';
        const values = [
            taskId,
            userId
        ]

        dbConnection.query(query, values, (error, result) => {
            if (error) res.status(500).json("Failed");
            res.status(200).json({
                message: "Successfully deleted",
                result: result
            })
        })
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Error deleting task' });
    }
});

module.exports = router;