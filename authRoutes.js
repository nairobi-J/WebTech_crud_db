const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
//pass hashing
const bcrypt = require('bcrypt');

const dbConnection = require('../config/db');
//registering new user 
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        console.log(username);
        //hasing pass for safety
        const hashedPassword = bcrypt.hashSync(password, 10);
        const query = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
        //db thik thak connect hoilei eta kaj krbe
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
        //login e username r password diye authenticate kora hobe
        dbConnection.query(sql, [values], async (err, result) => {
            if (err) return res.json("Error while login!");
            
            if (result.length > 0) {
                //ager mto same way to hash kre compare kra lagbe given pass er sathe
                const isValid = await bcrypt.compare(req.body.password, result[0].password);
                if (isValid) {
                    //tokenandadminhandler e ei kaj hbe
                    const token = jwt.sign({
                        email: result[0].email,
                        username: result[0].username,
                        role : result[0].role
                    }, process.env.ACCESS_TOKEN_SECRET, {
                        //token  will nto work after 30 min but i can generate new token right away with a new log in
                        expiresIn: '30m'
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
