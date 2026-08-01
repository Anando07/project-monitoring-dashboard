import api from "./api";

const ProjectService = {

    getAll() {
        return api.get("/projects");
    },

    getById(id) {
        return api.get(`/projects/${id}`);
    },

    save(data) {
        return api.post("/projects", data);
    },

    update(id, data) {
        return api.put(`/projects/${id}`, data);
    },

    delete(id) {
        return api.delete(`/projects/${id}`);
    }

};

export default ProjectService;