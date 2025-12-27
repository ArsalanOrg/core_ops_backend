// controllers/projectController.js
const { Op } = require('sequelize')
const sequelize = require('../../sequelize')
const Project = require('../../models/PM/projectModel')

// GET /projects – fetch all projects
exports.getAllProjects = async (req, res) => {
  const userId = Number(req.user.ID)
  const role = Number(req.user.Role)

  try {
    if (role === 3) {
      // board sees *every* non-deleted
      const projects = await Project.findAll({
        where: { DELETE_STATUS: 0 },
      })
      return res.json({ status: 'success', data: projects })
    }

    // everyone else sees only their own or those they're a member of
    const projects = await Project.findAll({
      where: {
        DELETE_STATUS: 0,
        [Op.or]: [
          { MANAGERID: userId },
          {
            PROJECTID: {
              [Op.in]: sequelize.literal(`(
                SELECT PROJECTID FROM WEB_PM_MEMBERS WHERE USERID = ${userId}
              )`),
            },
          },
        ],
      },
    })
    return res.json({ status: 'success', data: projects })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ status: 'error', message: err.message })
  }
}
// GET /projects/:id – fetch a single project by ID
exports.getProjectById = async (req, res) => {
  const { id } = req.params

  try {
    const project = await Project.findByPk(id)
    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found.',
      })
    }

    return res.status(200).json({
      status: 'success',
      message: 'Project fetched successfully.',
      data: project,
    })
  } catch (error) {
    console.error(`Error fetching project (ID: ${id}):`, error)
    return res.status(500).json({
      status: 'error',
      message: `Failed to fetch project with id=${id}.`,
      error: error.message,
    })
  }
}

// POST /projects – create a new project
exports.createProject = async (req, res) => {
  const {
    MANAGERID = req.user.dataValues.ID,
    DEPARTMENTID,
    NAME,
    TYPE,
    ACRHIEVE,
    DELETE_STATUS,
    NKOD1,
    NKOD2,
    SKOD1,
    SKOD2,
    DATE,
    START_DATE,
    FINISH_DATE,
    CURRENT_USERID,
    UPDATE_USERID,
  } = req.body
  const deptRole = req.user.dataValues.DepartmentRole
  // Basic validation
  // if (MANAGERID == null || typeof MANAGERID !== 'number') {
  //   return res.status(400).json({
  //     status: 'error',
  //     message: 'MANAGERID is required and must be a number.',
  //   })
  // }
  if (NAME != null && typeof NAME !== 'string') {
    return res.status(400).json({
      status: 'error',
      message: 'NAME, if provided, must be a string.',
    })
  }
  // only department head can create projects
  if (deptRole !== 2) {
    return res.status(403).json({
      status: 'fail',
      message: 'Only department head can create projects.',
    })
  }
  try {
    const newProject = await Project.create({
      MANAGERID,
      DEPARTMENTID: DEPARTMENTID || null,
      NAME: NAME || null,
      TYPE: TYPE || null,
      ACRHIEVE: ACRHIEVE || null,
      DELETE_STATUS: DELETE_STATUS,
      NKOD1: NKOD1 || null,
      NKOD2: NKOD2 || null,
      SKOD1: SKOD1 || null,
      SKOD2: SKOD2 || null,
      DATE: DATE || null,
      UPDATEDATE: new Date(),
      START_DATE: START_DATE || null,
      FINISH_DATE: FINISH_DATE || null,
      UPDATE_DATE: new Date(),
      CURRENT_USERID: CURRENT_USERID || null,
      UPDATE_USERID: UPDATE_USERID || null,
    })

    return res.status(201).json({
      status: 'success',
      message: 'Project created successfully.',
      data: newProject,
    })
  } catch (error) {
    console.error('Error creating project:', error)
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create project.',
      error: error.message,
    })
  }
}

// PUT /projects/:id – update an existing project
exports.updateProject = async (req, res) => {
  const {
    PROJECTID,
    MANAGERID,
    DEPARTMENTID,
    NAME,
    TYPE,
    ACRHIEVE,
    DELETE_STATUS,
    NKOD1,
    NKOD2,
    SKOD1,
    SKOD2,
    DATE,
    START_DATE,
    FINISH_DATE,
    CURRENT_USERID,
    UPDATE_USERID,
  } = req.body

  try {
    const project = await Project.findByPk(PROJECTID)
    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found.',
      })
    }

    // Update fields if provided
    if (MANAGERID !== undefined) project.MANAGERID = MANAGERID
    if (DEPARTMENTID !== undefined) project.DEPARTMENTID = DEPARTMENTID
    if (NAME !== undefined) project.NAME = NAME
    if (TYPE !== undefined) project.TYPE = TYPE
    if (ACRHIEVE !== undefined) project.ACRHIEVE = ACRHIEVE
    if (DELETE_STATUS !== undefined) project.DELETE_STATUS = DELETE_STATUS
    if (NKOD1 !== undefined) project.NKOD1 = NKOD1
    if (NKOD2 !== undefined) project.NKOD2 = NKOD2
    if (SKOD1 !== undefined) project.SKOD1 = SKOD1
    if (SKOD2 !== undefined) project.SKOD2 = SKOD2
    if (DATE !== undefined) project.DATE = DATE
    if (START_DATE !== undefined) project.START_DATE = START_DATE
    if (FINISH_DATE !== undefined) project.FINISH_DATE = FINISH_DATE
    if (CURRENT_USERID !== undefined) project.CURRENT_USERID = CURRENT_USERID
    if (UPDATE_USERID !== undefined) project.UPDATE_USERID = UPDATE_USERID

    // bump the update timestamps
    project.UPDATEDATE = new Date()
    project.UPDATE_DATE = new Date()

    await project.save()

    return res.status(200).json({
      status: 'success',
      message: 'Project updated successfully.',
      data: project,
    })
  } catch (error) {
    console.error(`Error updating project (ID: ${PROJECTID}):`, error)
    return res.status(500).json({
      status: 'error',
      message: `Failed to update project with id=${PROJECTID}.`,
      error: error.message,
    })
  }
}

// DELETE /projects/:id – soft-delete a project
exports.deleteProject = async (req, res) => {
  const { PROJECTID, CHECK } = req.body

  try {
    const project = await Project.findByPk(PROJECTID)
    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found.',
      })
    }

    project.DELETE_STATUS = 1
    project.UPDATEDATE = new Date()
    project.UPDATE_DATE = new Date()

    await project.save()

    return res.status(200).json({
      status: 'success',
      message: 'Project soft-deleted successfully.',
      data: project,
    })
  } catch (error) {
    console.error(`Error soft-deleting project (ID: ${id}):`, error)
    return res.status(500).json({
      status: 'error',
      message: `Failed to delete project with id=${id}.`,
      error: error.message,
    })
  }
}
