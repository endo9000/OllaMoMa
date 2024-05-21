document.addEventListener("alpine:init", () => {
    // Use regex to match the hash
    const re = /q=(?<model>[\w\-/:]*)/;
    const m = window.location.hash.match(re);

    Alpine.data("modelData", () => ({

    searchNeedle: m? m.groups.model : "",
    modelList: JSON.parse(document.getElementById("model_list").textContent).sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
    }),

    name_decending: false,
    sort_by_name() {
        const direction = this.name_decending? -1 : 1;
        this.modelList.sort((a, b) => {
            if (a.name < b.name) return direction;
            if (a.name > b.name) return -direction;
            return 0;
        });
        this.name_decending = !this.name_decending;
    },
    
    filesize_decending: false,
    sort_by_filesize() {
        const direction = this.filesize_decending? -1 : 1;
        this.modelList.sort((a, b) => {
            if (a.size < b.size) return direction;
            if (a.size > b.size) return -direction;
            return 0;
        });
        this.filesize_decending = !this.filesize_decending;
    },

    paramsize_decending: false,
    sort_by_paramsize() {
        const direction = this.paramsize_decending? -1 : 1;
        this.modelList.sort((a, b) => {
            if (a.parameter_size < b.parameter_size) return direction;
            if (a.parameter_size > b.parameter_size) return -direction;
            return 0;
        });
        this.paramsize_decending = !this.paramsize_decending;
    },

    lastdate_decending: true,
    sort_by_lastmod() {
        const direction = this.lastdate_decending? -1 : 1;
        this.modelList.sort((a, b) => {
            if (a.modified_at < b.modified_at) return direction;
            if (a.modified_at > b.modified_at) return -direction;
            return 0;
        });
        this.lastdate_decending = !this.lastdate_decending;
    },
    
    formatDate(dateString) {
        const isoString = `last modified: ${dateString}`;
        const date = new Date(isoString.substring(15));
        const now = new Date();
        const ago = Math.floor((now - date) / (1000 * 3600 * 24));
        let formattedDate = date.toLocaleDateString();
        if (ago === 0) {
            formattedDate += ' (today)';
        } else if (ago === 1) {
            formattedDate += ` (1 day ago)`;
        } else {
            formattedDate += ` (${ago} days ago)`;
        }
        return formattedDate;
    },
    
    formatSize(size) {
        const bytes = parseInt(size);
        const mbSize = bytes / (1024 * 1024);
        const gbSize = mbSize / 1024;
        if (gbSize >= 1) {
        return `${gbSize.toFixed(2)} GB`;
        } else {
        return `${mbSize.toFixed(2)} MB`;
        }
    },

    fetchModelFile: (model) => {
        if (model.modelFile === null) {
            fetch(`get-model-file/${model.name}/`)
                .then((response) => {
                    return response.text();
                })
                .then((file) => {
                    model.modelFile = file;
                });
        }
    },

    copyModel(modelName, newModelName) {
        fetch(`/copy-model/${modelName}/${newModelName}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.cookie.split("=")[1] // Add CSRF token to DELETE request
            },
        });
    },
    
    deleteModel(modelName) {
        fetch(`/delete-model/${modelName}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.cookie.split("=")[1] // Add CSRF token to DELETE request
            },
        }).catch((e) => {
            console.error("ERROR:", e);
        }).then(() => {            
            console.log(`${modelName} deleted!`);
            document.getElementById(modelName).remove();
        });
    },

    renameModel(modelName, newModelName) {
        copyModel(modelName, newModelName)
            .then(() => {
                deleteModel(modelName);
            });
    },


    }));

    Alpine.data("textareaData", () => ({
    counter: 0,
    }));
});
