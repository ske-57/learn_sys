require('dotenv').config();

const express = require('express')
const employeeRouter = require('./routes/employee.routes');
const courseRouter = require('./routes/course.routes');
const groupRouter = require('./routes/group.routes');
const organizationRouter = require('./routes/organizations.routes');
const { generateProtocolDocx } = require('./generateCourseProtocol');
const cors = require('cors');
const http = require('http');

const PORT = process.env.PORT || '443';
const app = express();

app.use(express.json())
app.use(cors());

app.get('/health', (req, res) => res.sendStatus(200)); // Дефолт проверка на доступност
app.use('/api', employeeRouter)
app.use('/api', courseRouter)
app.use('/api', groupRouter)
app.use('/api', organizationRouter);

app.post('/api/generate-course-protocol', async (req, res) => {
    try {
        const data = req.body;

        const buffer = generateProtocolDocx(data);

        res.setHeader(
            'Content-Disposition',
            'attachment; filename=course_protocol.docx');
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.send(buffer);
    } catch (error) {
        console.error('Error generating course protocol:', error);
        res.status(500).json({ error: 'Failed to generate course protocol' });
    }
})

const server = http.createServer(app);


server.listen(PORT, () => console.log(`Listening PORT: ${PORT}`));

console.log("Starting....");