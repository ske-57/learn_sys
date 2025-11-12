require('dotenv').config();

const express = require('express')
const userRouter = require('./routes/user.routes')
const cors = require('cors');
const http = require('http');

const PORT = process.env.PORT || '443';
const app = express();

app.use(express.json())
app.use(cors());

app.get('/health', (req, res) => res.sendStatus(200)); // Дефолт проверка на доступност
app.use('/api', userRouter)

const server = http.createServer(app);


server.listen(PORT, () => console.log(`Listening PORT: ${PORT}`));

console.log("Starting....");