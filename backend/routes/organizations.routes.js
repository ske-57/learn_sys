const Router = require('express');
const router = new Router();
const organizationsController = require('../controller/organizations.controller');

router.post('/organizations', organizationsController.createOrganization);

router.get('/organizations', organizationsController.getOrganizations);

module.exports = router;