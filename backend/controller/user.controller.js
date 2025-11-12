const { response } = require('express')
const db = require('../db.origin')

class UserController {

    // Создание пользователя / createUser
    async createUser(req, res) {

        const { user_tg_id, adm, lastname, firstname, midllename, phone, email, bayer } = req.body
        const newUser = await db.query(`INSERT INTO public.users(user_tg_id, adm, lastname, firstname, midllename, phone, email, bayer) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`, [user_tg_id, adm, lastname, firstname, midllename, phone, email, bayer])
        res.json(newUser.rows[0])
    }

    async getUsers(req, res) {
        const users = await db.query(`SELECT user_tg_id, adm, lastname, firstname, midllename, phone, email, bayer
	FROM public.users;`)
        res.json(users.rows)
    }
}

module.exports = new UserController()