const Router = require('express');
const router = new Router();
const groupsController = require('../controller/groups.controller');


router.post('/groups', groupsController.CreateGroup);

router.get('/groups', groupsController.GetGroups);

router.get('/groups/:groupId', groupsController.getGroupById)

// Partial update of group (course_id, start_date, end_date)
router.patch('/groups/:groupId', groupsController.updateGroup)

router.post('/groups/:groupId/members', groupsController.addGroupMember);

router.get('/groups/:groupId/members', groupsController.getGroupMembersById);

router.delete('/groups/:groupId/members/:employeeId', groupsController.deleteGroupMember);


module.exports = router;