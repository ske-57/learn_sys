require('dotenv').config();

const express = require('express')
const employeeRouter = require('./routes/employee.routes');
const courseRouter = require('./routes/course.routes');
const cors = require('cors');
const http = require('http');

const PORT = process.env.PORT || '443';
const app = express();

app.use(express.json())
app.use(cors());

app.get('/health', (req, res) => res.sendStatus(200)); // Дефолт проверка на доступност
app.use('/api', employeeRouter)
app.use('/api', courseRouter)

const server = http.createServer(app);


server.listen(PORT, () => console.log(`Listening PORT: ${PORT}`));

console.log("Starting....");