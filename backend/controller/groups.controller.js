const db = require('../db.origin');

class GroupsController {

    async CreateGroup(req, res) {
        try {
            const {
                id,
                start_date,
                end_date,
                course_id
            } = req.body

            if (!id) {
                return res.status(400).json({ error: 'ID should not be provided when creating a new group' });
            }

            // required fields according to DB schema
            if (!course_id) {
                return res.status(400).json({ error: 'Missing required fields: course' })
            }

            if (!start_date) {
                return res.status(400).json({ error: 'Missing required field: start_date' })
            }

            const result = await db.query(
                `INSERT INTO groups(
                    id, start_date, end_date, course_id
                ) VALUES($1,$2,$3,$4) RETURNING *`,
                [
                    id,
                    start_date,
                    end_date || null,
                    course_id
                ]
            )

            return res.status(201).json(result.rows[0])
        } catch (err) {
            console.error('CreateGroup error', err)
            // handle FK violation (invalid course_id)
            if (err && err.code === '23503') {
                return res.status(400).json({ error: 'Invalid course_id' })
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
            const { id } = req.params;

            const membersResult = await db.query(
                `SELECT e.id, e.name, e.last_name, e.middle_name, o.name as organization_name
                 FROM group_members gm
                 JOIN employees e ON e.id = gm.employee_id
                 JOIN organizations o ON o.id = e.organization_id
                 WHERE gm.group_id = $1`,
                [
                    id
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
}

module.exports = new GroupsController();