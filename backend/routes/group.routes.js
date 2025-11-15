const Router = require('express');
const router = new Router();
const groupsController = require('../controller/groups.controller');


router.post('/groups', groupsController.CreateGroup);

router.get('/groups', groupsController.GetGroups);


module.exports = router;