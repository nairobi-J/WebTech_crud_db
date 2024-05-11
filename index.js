
const express = require('express');
const app = express();
//register, login, getting token
const userRoutes = require('./routes/authRoutes');
//task update delete save
const taskRoutes = require('./routes/taskRoutes');
//loads environment variable
const dotenv = require('dotenv');

app.use(express.json());
dotenv.config();
app.use('/users', userRoutes);
app.use('/tasks', taskRoutes);



const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
