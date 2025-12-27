const { getPool } = require('../../utils/pool')

// controllers/memberController.js

const Member = require('../../models/PM/memberModel')
const User = require('../../models/userModel')
const Project = require('../../models/PM/projectModel')


exports.getAllMembers = async (req, res) => {
  try {
    const members = await User.findAll({
      where: {
        UserStatus: 1,
      },
    })
    return res.status(200).json({
      status: 'success',
      message: 'Members fetched successfully.',
      data: members,
    })
  } catch (error) {
    console.error('Error fetching members:', error)
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch members.',
      error: error.message,
    })
  }
}

// GET /members/:id – fetch a single member by ID
exports.getMemberById = async (req, res) => {
  const { id } = req.params

  try {
    const member = await Member.findByPk(id)
    if (!member) {
      return res.status(404).json({
        status: 'error',
        message: 'Member not found.',
      })
    }

    return res.status(200).json({
      status: 'success',
      message: 'Member fetched successfully.',
      data: member,
    })
  } catch (error) {
    console.error(`Error fetching member (ID: ${id}):`, error)
    return res.status(500).json({
      status: 'error',
      message: `Failed to fetch member with id=${id}.`,
      error: error.message,
    })
  }
}

// controllers/memberController.js

exports.addMember = async (req, res) => {
  const { PROJECTID, USERIDS } = req.body
  const now = new Date()
  // only project managers can add members
  const project = await Project.findByPk(PROJECTID)
  const currentUser = req.user.dataValues.ID
  const projectManager = project.dataValues.MANAGERID

  if (projectManager !== currentUser) {
    return res.status(403).json({
      status: 'error',
      message: 'Only project managers can add members.',
    })
  }

  // validation
  if (!Array.isArray(USERIDS) || USERIDS.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'USERIDS must be a non-empty array of IDs.',
    })
  }

  try {
    // build an array of objects to insert
    const membersToCreate = USERIDS.map((uid) => ({
      PROJECTID: PROJECTID || null,
      USERID: uid,
      DATE: now,
    }))

    // bulk insert
    const newMembers = await Member.bulkCreate(membersToCreate, {
      returning: true, // if you want the created rows back
    })

    return res.status(201).json({
      status: 'success',
      message: `${newMembers.length} member(s) added successfully.`,
      data: newMembers,
    })
  } catch (error) {
    console.error('Error creating members:', error)
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create members.',
      error: error.message,
    })
  }
}

// PUT /members/:id – update an existing member
exports.updateMember = async (req, res) => {
  const { id } = req.params
  const { PROJECTID, USERID, NKOD1, NKOD2, SKOD1, SKOD2, DATE } = req.body

  try {
    const member = await Member.findByPk(id)
    if (!member) {
      return res.status(404).json({
        status: 'error',
        message: 'Member not found.',
      })
    }

    // Update only provided fields
    if (PROJECTID !== undefined) member.PROJECTID = PROJECTID
    if (USERID !== undefined) member.USERID = USERID
    if (NKOD1 !== undefined) member.NKOD1 = NKOD1
    if (NKOD2 !== undefined) member.NKOD2 = NKOD2
    if (SKOD1 !== undefined) member.SKOD1 = SKOD1
    if (SKOD2 !== undefined) member.SKOD2 = SKOD2
    if (DATE !== undefined) member.DATE = DATE

    await member.save()

    return res.status(200).json({
      status: 'success',
      message: 'Member updated successfully.',
      data: member,
    })
  } catch (error) {
    console.error(`Error updating member (ID: ${id}):`, error)
    return res.status(500).json({
      status: 'error',
      message: `Failed to update member with id=${id}.`,
      error: error.message,
    })
  }
}

// DELETE /members/:id – remove a member
exports.deleteMember = async (req, res) => {
  const { PROJECTID, USERID } = req.body
  const pid = parseInt(PROJECTID, 10)

  try {
    // directly delete without fetching first
    const project = await Project.findByPk(PROJECTID)

    const currentUser = req.user.dataValues.ID
    const projectManager = project.dataValues.MANAGERID

    if (projectManager !== currentUser) {
      return res.status(403).json({
        status: 'error',
        message: 'Only project managers can delete members.',
      })
    }
    const rowsDeleted = await Member.destroy({
      where: {
        PROJECTID: pid,
        USERID: USERID,
      },
    })

    if (!rowsDeleted) {
      return res.status(404).json({
        status: 'error',
        message: 'Member not found.',
      })
    }

    return res.status(200).json({
      status: 'success',
      message: 'Member deleted successfully.',
      data: { PROJECTID: pid, USERID },
    })
  } catch (error) {
    console.error(
      `Error deleting member PROJECTID=${PROJECTID}, USERID=${USERID}`,
      error
    )
    return res.status(500).json({
      status: 'error',
      message: `Failed to delete member.`,
      error: error.message,
    })
  }
}

// (Optional) if you still want to list project-specific members directly:
exports.projectMembersList = async (req, res) => {
  try {
    const pool = await getPool()
    const result = await pool
      .request()
      .input('ProjectID', sql.Int, req.body.PROJECTID).query(`
        SELECT 
          m.UserID,
          u.FullName,
          u.UserName
        FROM WEB_PM_MEMBERS m
        JOIN user_table u 
          ON u.ID = m.UserID
        WHERE m.ProjectID = @ProjectID
      `)

    res.json({
      status: 'success',
      data: result.recordset,
    })
  } catch (err) {
    console.error(err)
    res.status(400).json({ status: 'fail', message: err.message })
  }
}
