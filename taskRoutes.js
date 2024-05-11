const express = require('express');
//paths
const router = express.Router();
//for databse
const dbConnection = require('../config/db');
//to add task i need to be authenticated as a user for this i get token admin verifying is imp because admin can delete and see all task
const { verifyToken, isAdmin } = require('../middleware/tokenAndAdminHandler');
//getting user individual tasks
router.get('/getTask', verifyToken, async (req, res) => {
    try {
        //fetching email from json
        const userId = req.email;
        //fetching user id as needed to know role if he is user !!!
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
 //getting all task veifying if i am registred as a admin or not 

router.get('/getAllTask', verifyToken, async (req, res) => {
    try {
        const userRole = req.role;
        if (req.role === "admin") {
            const userId = req.email;
            const query = 'SELECT * FROM tasks';
            //needed to know if it is an admin who logged in to get all task
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

//adding task, i can't add task unless i am authenticated as a verified user
router.post('/addTask', verifyToken, async (req, res) => {
    try {
        const userId = req.email;
        //giving task detail
        const { title, description, status } = req.body;
        //query work
        const query = 'INSERT INTO tasks (title, description, status, user_id) VALUES (?, ?, ?, ?)';
        //sendiing values to the db await for taking time to manage things
        await dbConnection.query(query, [title, description, status, userId]);

        res.status(201).json({ message: 'Task created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error creating task' });
    }
});

//to update a task i should add that specific task
router.put('/updateTask/:id', verifyToken, async (req, res) => {
    try {
        const userId = req.email; // Retrieve user ID from the authenticated user
        const taskId = req.params.id;
         
        const query = 'UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ? AND user_id = ?';
        const values = [
            //taking updated datas. 
            req.body.title,
            req.body.description,
            req.body.status,
            taskId,
            userId
        ]
       //err handle
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
//delete er functioning same bro like updating be admin or i can only delete my task!!
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
