const db = require('../db');
const calendar = require('isdayoff')();

const WORK_DAY_HOURS = 8;
const WORK_CODES = new Set([0, 2, 4]); // рабочие коды

const toYMD = (date) => date.toISOString().slice(0, 10);

const normalizeStartDate = (startDateStr) => {
    if (startDateStr instanceof Date) {
        return new Date(
            startDateStr.getFullYear(),
            startDateStr.getMonth(),
            startDateStr.getDate()
        );
    }
    const d = new Date(startDateStr + 'T00:00:00');
    if (Number.isNaN(d.getTime())) {
        throw new Error('Invalid start_date');
    }
    return d;
};

/**
 * startDateStr - 'YYYY-MM-DD'
 * totalHours   - общее количество часов
 */
async function calculateEndDateByHours(startDateStr, totalHours) {
    if (!totalHours || totalHours <= 0) {
        throw new Error('Course hours must be positive');
    }

    let cursor = normalizeStartDate(startDateStr);
    let remaining = Number(totalHours);
    const MAX_CHUNK_DAYS = 366;

    while (true) {
        const chunkStart = new Date(cursor);
        const chunkEnd = new Date(chunkStart);
        chunkEnd.setDate(chunkEnd.getDate() + (MAX_CHUNK_DAYS - 1));

        const codes = await calendar.period({ start: chunkStart, end: chunkEnd });

        for (let i = 0; i < codes.length; i++) {
            if (WORK_CODES.has(codes[i])) {
                remaining -= Math.min(WORK_DAY_HOURS, remaining);
                if (remaining === 0) {
                    const endDate = new Date(chunkStart);
                    endDate.setDate(endDate.getDate() + i + 1);
                    return toYMD(endDate);
                }
            }
        }
        
        cursor = new Date(chunkEnd);
        cursor.setDate(cursor.getDate() + 1);
    }
}


class GroupsController {

    async CreateGroup(req, res) {
        try {
            const { id, start_date, end_date, course_id } = req.body

            if (!id || !course_id || !start_date) {
                return res.status(400).json({ error: 'Missing required fields: id, course_id or start_date' });
            }

            // Получение часов курса
            const courseHoursResult = await db.query(
                `SELECT SUM(cl.hours) as hours FROM course_lessons cl
                WHERE cl.course_id = $1`,
                [ course_id ]
            );

            const courseHours = Number(courseHoursResult.rows[0]?.hours);

            if (!courseHours || courseHours <= 0) {
                return res.status(400).json({ error: 'Course hours must be greater than 0' });
            }

            let finalEndDate = end_date || null;

            if (!finalEndDate) {
                try {
                    finalEndDate = await calculateEndDateByHours(start_date, courseHours);
                } catch (err) {
                    console.error('Error when calculating end date', err);
                    return res.status(500).json({ error: 'Cannot calculate end_date' });
                }
            }

            const result = await db.query(
                `INSERT INTO groups(
                    id, start_date, end_date, course_id
                ) VALUES($1,$2,$3,$4) RETURNING *`,
                [ id, start_date, finalEndDate || null, course_id ]
            )

            return res.status(201).json(result.rows[0])

        } catch (err) {
            console.error('CreateGroup error', err)

            if (err && err.code === '23503') {
                return res.status(400).json({ error: 'Invalid course_id' })
            }

            if (err && err.code === '23505') {
                return res.status(409).json({ error: `${err.detail}` });
            }
            return res.status(500).json({ error: 'Internal server error' })
        }
    }


    async GetGroups(req, res) {
        try {

            const groups = await db.query(`
                SELECT g.id, g.start_date, g.end_date, c.name as course_name
                FROM groups g 
                JOIN courses c ON c.id = g.course_id;
                `)

            return res.status(200).json(groups.rows)

        } catch (err) {
            console.error('GetGroups error', err)
            return res.status(500).json({ error: 'Internal server error' })
        }
    }

    async getGroupMembersById(req, res) {
        try {
            const { groupId } = req.params;

            const membersResult = await db.query(
                `SELECT e.id, e.name, e.last_name, e.middle_name, e.grade, o.name as organization_name
                 FROM group_members gm
                 JOIN employees e ON e.id = gm.employee_id
                 JOIN organizations o ON o.id = e.organization_id
                 WHERE gm.group_id = $1`,
                [
                    groupId
                ]
            );
            return res.status(200).json(membersResult.rows);
        } catch (err) {
            console.error('getGroupMembersById error', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async addGroupMember(req, res) {
        try {
            const { groupId } = req.params;
            const { employee_id } = req.body;

            // Check if the group exists
            const groupResult = await db.query(
                `SELECT * FROM groups WHERE id = $1`,
                [
                    groupId
                ]
            );
            if (groupResult.rows.length === 0) {
                return res.status(404).json({ error: 'Group not found' });
            }

            // Check if the employee exists
            const employeeResult = await db.query(
                `SELECT * FROM employees WHERE id = $1`,
                [
                    employee_id
                ]
            );
            if (employeeResult.rows.length === 0) {
                return res.status(404).json({ error: 'Employee not found' });
            }

            // Add employee to group
            await db.query(
                `INSERT INTO group_members (group_id, employee_id) VALUES ($1, $2)`,
                [
                    groupId,
                    employee_id
                ]
            );

            return res.status(200).json({ message: 'Employee added to group successfully' });
        } catch (err) {
            console.error('addEmployeeToGroup error', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getGroupById(req, res) {

        const { groupId } = req.params;

        try {

            const groups = await db.query(
                `SELECT * FROM groups g WHERE g.id = $1`,
                [
                    groupId
                ]
            )
            return res.status(200).json(groups.rows[0])
        } catch (err) {
            console.error('get group by ID error', err);
            return res.status(500).json({ error: 'Internal server error' })
        }
    }

    async deleteGroupMember(req, res) {
        try {
            const { groupId, employeeId } = req.params

            if (!groupId || groupId <= 0) {
                return res.status(400).json({ error: 'Group id can`t be less than one' })
            }
            if (!employeeId || employeeId <= 0) {
                return res.status(400).json({ error: 'Employee id can`t be less than one' })
            }

            const employeeResult = await db.query(
                `SELECT e.id FROM employees e WHERE e.id = $1`,
                [
                    employeeId
                ]
            )
            if (employeeResult.rows.length === 0) {
                return res.status(404).json({ error: `Employee with ${employeeId} not found` })
            }

            const result = await db.query(
                `DELETE FROM group_members gm WHERE gm.group_id = $1 AND gm.employee_id = $2`,
                [
                    groupId,
                    employeeId
                ]
            )
            return res.status(200).json({ message: `Group member with id ${employeeId} deleted succesfull` })
        } catch (err) {
            console.error(err)
            return res.status(500).json({ error: 'Internal server error' })
        }
    }
}

module.exports = new GroupsController();