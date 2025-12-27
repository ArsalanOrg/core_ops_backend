// controllers/departmentController.js

const Department = require('../models/departmentModel')

// GET /departments – fetch all departments
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll({
      where: {
        Status: 1,
      },
    })
    return res.status(200).json({
      status: 'success',
      message: 'Departments fetched successfully.',
      data: departments,
    })
  } catch (error) {
    console.error('Error fetching departments:', error)
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch departments.',
      error: error.message,
    })
  }
}

// GET /departments/:id – fetch a single department by ID
exports.getDepartmentById = async (req, res) => {
  const { id } = req.params

  try {
    const department = await Department.findByPk(id)
    if (!department) {
      return res.status(404).json({
        status: 'error',
        message: 'Department not found.',
      })
    }

    return res.status(200).json({
      status: 'success',
      message: 'Department fetched successfully.',
      data: department,
    })
  } catch (error) {
    console.error(`Error fetching department (ID: ${id}):`, error)
    return res.status(500).json({
      status: 'error',
      message: `Failed to fetch department with id=${id}.`,
      error: error.message,
    })
  }
}

// POST /departments – create a new department
exports.createDepartment = async (req, res) => {
  const { Name, Description, Code, Status = 1 } = req.body

  // Minimal validation example
  if (!Name || typeof Name !== 'string') {
    return res.status(400).json({
      status: 'error',
      message: 'Name is required and must be a string.',
    })
  }

  try {
    const newDept = await Department.create({
      Name,
      Description: Description || null,
      Code: Code || null,
      Status: Status || 1,
      // DateCreated and DateUpdated both default to NOW()
    })

    return res.status(201).json({
      status: 'success',
      message: 'Department created successfully.',
      data: newDept,
    })
  } catch (error) {
    console.error('Error creating department:', error)
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create department.',
      error: error.message,
    })
  }
}

// PUT /departments/:id – update an existing department
exports.updateDepartment = async (req, res) => {
  const { id } = req.params
  const { Name, Description, Code, Status } = req.body

  try {
    const department = await Department.findByPk(id)
    if (!department) {
      return res.status(404).json({
        status: 'error',
        message: 'Department not found.',
      })
    }

    // Update fields if provided
    if (Name !== undefined) department.Name = Name
    if (Description !== undefined) department.Description = Description
    if (Code !== undefined) department.Code = Code
    if (Status !== undefined) department.Status = Status

    // Manually bump DateUpdated
    department.DateUpdated = new Date()

    await department.save()

    return res.status(200).json({
      status: 'success',
      message: 'Department updated successfully.',
      data: department,
    })
  } catch (error) {
    console.error(`Error updating department (ID: ${id}):`, error)
    return res.status(500).json({
      status: 'error',
      message: `Failed to update department with id=${id}.`,
      error: error.message,
    })
  }
}

// DELETE /departments/:id – delete a department
exports.deleteDepartment = async (req, res) => {
  const { id } = req.params

  try {
    const department = await Department.findByPk(id)
    if (!department) {
      return res.status(404).json({
        status: 'error',
        message: 'Department not found.',
      })
    }

    // Soft delete
    department.Status = 0
    await department.save()
    return res.status(200).json({
      status: 'success',
      message: 'Department deleted successfully.',
      data: department,
    })
  } catch (error) {
    console.error(`Error deleting department (ID: ${id}):`, error)
    return res.status(500).json({
      status: 'error',
      message: `Failed to delete department with id=${id}.`,
      error: error.message,
    })
  }
}
