document.addEventListener("alpine:init", () => {
    Alpine.data("modelData", () => ({
    init () {
        for (model of this.modelList) {
            this.fetchModelFile(model);
        }
    },
    searchNeedle: "",
    modelList: JSON.parse(document.getElementById("model_list").textContent),

    formatDate(dateString) {
        const isoString = `last modified: ${dateString}`;
        const date = new Date(isoString.substring(15));
        const now = new Date();
        const ago = Math.floor((now - date) / (1000 * 3600 * 24));
        let formattedDate = date.toLocaleDateString();
        if (ago === 1) {
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
        fetch(`/duplicate-model/${modelName}/${newModelName}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': '{{ csrf_token }}' // Add CSRF token to DELETE request
            },
        });
    },
    
    renameModel(modelName, newModelName) {
        fetch(`/rename-model/${modelName}/${newModelName}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': '{{ csrf_token }}' // Add CSRF token to DELETE request
            },
        });
    },
    
    deleteModel(modelName) {
        fetch(`/delete-model/${modelName}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': '{{ csrf_token }}' // Add CSRF token to DELETE request
            },
        });
    },

    }));

    Alpine.data("textareaData", () => ({
    counter: 0,
    }));
});
