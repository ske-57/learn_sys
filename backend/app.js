require('dotenv').config();

const express = require('express')
const employeeRouter = require('./routes/employee.routes');
const courseRouter = require('./routes/course.routes');
const groupRouter = require('./routes/group.routes');
const organizationRouter = require('./routes/organizations.routes');
const { generateComissionProtocol } = require('./generateComissionProtocol');
const cors = require('cors');
const http = require('http');
const { generateAcceptedProtocol } = require('./generateAcceptedProtocol');
const { generateVisitingProtocol } = require('./generateVisitingProtocol');
const { calculateScheduleByLessons } = require('./utils/sheudleCalculator');

const PORT = process.env.PORT || '443';
const app = express();

app.use(express.json())
app.use(cors());

app.get('/health', (req, res) => res.sendStatus(200)); // Дефолт проверка на доступность
app.use('/api', employeeRouter)
app.use('/api', courseRouter)
app.use('/api', groupRouter)
app.use('/api', organizationRouter);

app.post('/api/generate-comission-protocol', (req, res) => {
  try {
    const data = req.body ?? {};

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid request body. Expected JSON object.' });
    }

    const maybeBuffer = generateComissionProtocol(data);

    // если генератор вернул Promise (на будущее)
    if (maybeBuffer && typeof maybeBuffer.then === 'function') {
      return maybeBuffer
        .then((buffer) => {
          if (!Buffer.isBuffer(buffer)) {
            return res.status(500).json({ error: 'Generator returned non-buffer result.' });
          }

          res.setHeader(
            'Content-Disposition',
            'attachment; filename="comission_protocol.docx"'
          );
          res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          );

          return res.status(200).end(buffer);
        })
        .catch((error) => {
          console.error('Error generating comission protocol:', error);
          if (!res.headersSent) {
            return res.status(500).json({ error: 'Failed to generate comission protocol' });
          }
        });
    }

    const buffer = maybeBuffer;

    if (!Buffer.isBuffer(buffer)) {
      return res.status(500).json({ error: 'Generator returned non-buffer result.' });
    }

    res.setHeader(
      'Content-Disposition',
      'attachment; filename="comission_protocol.docx"'
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );

    return res.status(200).end(buffer);
  } catch (error) {
    console.error('Error generating comission protocol:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to generate comission protocol' });
    }
  }
});


app.post('/api/generate-accepted-protocol', (req, res) => {
  try {
    const data = req.body ?? {};

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid request body. Expected JSON object.' });
    }

    const maybeBuffer = generateAcceptedProtocol(data);

    // Если генератор внезапно async и вернул Promise
    if (maybeBuffer && typeof maybeBuffer.then === 'function') {
      return maybeBuffer
        .then((buffer) => {
          if (!Buffer.isBuffer(buffer)) {
            return res.status(500).json({ error: 'Generator returned non-buffer result.' });
          }

          res.setHeader(
            'Content-Disposition',
            'attachment; filename="accepted_protocol.docx"'
          );
          res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          );

          return res.status(200).end(buffer);
        })
        .catch((error) => {
          console.error('Error generating accepted protocol:', error);
          if (!res.headersSent) {
            return res.status(500).json({ error: 'Failed to generate accepted protocol' });
          }
        });
    }

    const buffer = maybeBuffer;

    if (!Buffer.isBuffer(buffer)) {
      return res.status(500).json({ error: 'Generator returned non-buffer result.' });
    }

    res.setHeader(
      'Content-Disposition',
      'attachment; filename="accepted_protocol.docx"'
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );

    return res.status(200).end(buffer);
  } catch (error) {
    console.error('Error generating accepted protocol:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to generate accepted protocol' });
    }
  }
});


app.post('/api/generate-visiting-protocol', async (req, res) => {
  try {
    const data = req.body ?? {};

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid request body. Expected JSON object.' });
    }

    // ✅ считаем расписание (8ч/день, пропуск праздников)
    const { schedule, end_date } = await calculateScheduleByLessons(data.start_date, data.lessons);

    data.schedule = schedule;
    data.end_date = data.end_date || end_date; // если вдруг уже передали — не перетираем

    // при желании можно ещё и start/end по total hours посчитать:
    // data.end_date = data.end_date || await calculateEndDateByHours(data.start_date, data.hours);

    const buffer = generateVisitingProtocol(data);

    res.setHeader('Content-Disposition', 'attachment; filename="visiting_protocol.docx"');
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );

    return res.status(200).end(buffer);
  } catch (error) {
    console.error('Error generating visiting protocol:', error);
    return res.status(500).json({ error: 'Failed to generate visiting protocol' });
  }
});



const server = http.createServer(app);


// server.listen(PORT, () => console.log(`Listening PORT: ${PORT}`));

server.listen(8080, '127.0.0.1');

console.log("Starting....");