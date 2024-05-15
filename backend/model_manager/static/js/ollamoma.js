document.addEventListener("alpine:init", () => {
    Alpine.data("modelData", () => ({


    searchNeedle: "",
    modelList: JSON.parse(document.getElementById("model_list").textContent).sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
    }),

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
                    // console.log('Received model file:', file); // Add this line
                });
        }
    },
    

    copyModel(modelName, newModelName) {
        fetch(`/copy-model/${modelName}/${newModelName}/`, {
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
