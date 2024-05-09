const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dbConnection = require('../config/db');

router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        console.log(username);
        const hashedPassword = bcrypt.hashSync(password, 10);
        const query = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
        await dbConnection.query(query, [username, email, hashedPassword, role]);
        res.json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error occured in registering!', error);
        res.status(500).json({ error: 'Error occured while registering!' });
    }
});


router.post('/login', async (req, res) => {
    try {
        const sql = "SELECT * FROM users WHERE username = ?";
        const values = [req.body.username]

        dbConnection.query(sql, [values], async (err, result) => {
            if (err) return res.json("Error while login!");
            if (result.length > 0) {
                const isValid = await bcrypt.compare(req.body.password, result[0].password);
                if (isValid) {
                    const token = jwt.sign({
                        email: result[0].email,
                        username: result[0].username,
                        role : result[0].role
                    }, process.env.ACCESS_TOKEN_SECRET, {
                        expiresIn: '1h'
                    });

                    return res.status(200).json({
                        authentication_token: token,
                        message: 'Login Successfully'
                    });
                } else {
                    return res.status(400).json("Login Failed");
                }
            } else return res.status(500).json("Login Failed");
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Login Failed' });
    }
})

module.exports = router;