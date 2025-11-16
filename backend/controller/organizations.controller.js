const db = require('../db');

class OrganizationsController {

    // Create a new organization
    async createOrganization(req, res) {
        try {
            const { name } = req.body;

            // required fields according to DB schema
            if (!name) {
                return res.status(400).json({ error: 'Missing required field: name' });
            }

            const result = await db.query(
                `INSERT INTO organizations(
                    name
                ) VALUES($1) RETURNING *`,
                [
                    name
                ]
            );
            
            return res.status(201).json(result.rows[0]);
        } catch (err) {
            console.error('createOrganization error', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // List all organizations
    async getOrganizations(req, res) {
        try {
            const organizations = await db.query(`
                SELECT id, name FROM organizations
                `);
            return res.status(200).json(organizations.rows);
        } catch (err) {
            console.error('getOrganizations error', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new OrganizationsController();