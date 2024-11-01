

const express = require("express");

const router = express.Router();
const {
    getProjectById,
    createProject,
    listProjects,
    updateProject,
    deleteProject,
    listAllProjectsDetails,
    getAllProjectDetails,
    updateProjectStatus
} = require("../Controllers/projects");

// Middleware
const { auth } = require("../Middleware/auth");
const { upload } = require("../Middleware/upload");

router.post("/projects", auth, upload, createProject);   // Create a new project
router.get("/projects/:id", getProjectById);             // Get project by ID
router.get("/projects", listProjects);                   // List all projects
router.get("/projects/details/all", listAllProjectsDetails);    // List all project details
router.get("/projects/details/:id", getAllProjectDetails); // Get project details by ID
router.put("/projects/:id", auth, upload, updateProject); // Update project
router.patch("/projects/:id/status", auth, updateProjectStatus); // Update project status
router.delete("/projects/:id", auth, deleteProject);     // Delete project

module.exports = router;
