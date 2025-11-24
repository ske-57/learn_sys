const Router = require('express');
const router = new Router();
const groupsController = require('../controller/groups.controller');


router.post('/groups', groupsController.CreateGroup);

router.get('/groups', groupsController.GetGroups);

router.get('/groups/:groupId', groupsController.getGroupById)

router.post('/groups/:groupId/members', groupsController.addGroupMember);

router.get('/groups/:groupId/members', groupsController.getGroupMembersById);

router.delete('/groups/:groupId/members/:employeeId', groupsController.deleteGroupMember);


module.exports = router;