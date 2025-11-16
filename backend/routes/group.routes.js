const Router = require('express');
const router = new Router();
const groupsController = require('../controller/groups.controller');


router.post('/groups', groupsController.CreateGroup);

router.get('/groups', groupsController.GetGroups);

router.post('/groups/:groupId/members', groupsController.addGroupMember);

router.get('/groups/:id/members', groupsController.getGroupMembersById);


module.exports = router;