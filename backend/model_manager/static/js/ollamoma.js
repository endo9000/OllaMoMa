document.addEventListener("alpine:init", () => {
  Alpine.data("modelData", () => ({
    searchNeedle: "",
    modelList: JSON.parse(document.getElementById("model_list").textContent).sort((a, b) => a.name.localeCompare(b.name)),
    sortBy: "name",
    sortDirection: 1,
    nameDescending: false,
    filesizeDescending: false,
    paramsizeDescending: false,
    lastdateDescending: true,

    convertParamsToNumeric(param) {
      if (!param) return 0
      const unit = param[param.length - 1]
      let value = parseFloat(param.slice(0, -1))
      switch (unit) {
        case "M":
          value *= 1000000
          break
        case "B":
          value *= 1000000000
          break
        case "K":
          value *= 1000
          break
        default:
          console.log("Could not process parameter size:", param)
          return 0
      }
      return Math.floor(value)
    },

    formatDate(dateString) {
      const date = new Date(dateString)
      const now = new Date()
      const ago = Math.floor((now - date) / (1000 * 3600 * 24))
      let formattedDate = date.toLocaleDateString()
      if (ago === 0) {
        formattedDate += " (today)"
      } else if (ago === 1) {
        formattedDate += ` (1 day ago)`
      } else {
        formattedDate += ` (${ago} days ago)`
      }
      return formattedDate
    },

    formatSize(size) {
      const bytes = parseInt(size)
      const mbSize = bytes / (1024 * 1024)
      const gbSize = mbSize / 1024
      return gbSize >= 1 ? `${gbSize.toFixed(2)} GB` : `${mbSize.toFixed(2)} MB`
    },

    sort(by) {
      this.sortBy = by
      switch (by) {
        case "name":
          this.modelList.sort((a, b) => a.name.localeCompare(b.name) * this.sortDirection)
          this.nameDescending = !this.nameDescending
          break
        case "filesize":
          this.modelList.sort((a, b) => this.filesizeDescending ? a.size-b.size : b.size-a.size)
          this.filesizeDescending = !this.filesizeDescending
          break
        case "paramsize":
          this.modelList.sort((a, b) => this.paramsizeDescending 
            ? this.convertParamsToNumeric(a.details.parameter_size) - this.convertParamsToNumeric(b.details.parameter_size)
            : this.convertParamsToNumeric(b.details.parameter_size) - this.convertParamsToNumeric(a.details.parameter_size))
          this.paramsizeDescending = !this.paramsizeDescending
          break
        case "lastmod":
          this.modelList.sort((a, b) => a.modified_at.localeCompare(b.modified_at) * this.sortDirection)
          this.lastdateDescending = !this.lastdateDescending
          break
      }
      this.sortDirection = this.sortDirection * -1
    },

    fetchModelFile(model) {
      if (!model.modelFile) {
        fetch(`get-model-file/${model.name}/`)
          .then(response => response.text())
          .then(file => {
            model.modelFile = file
          })
      }
    },

    copyModel(modelName, newModelName) {
      fetch(`/copy-model/${modelName}/${newModelName}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": document.cookie.split("=")[1],
        },
      })
    },

    resetModel(modelName, modelFile) {
      console.log("works till here!")
      document.getElementById(`textarea-${modelName}-1`).value = modelFile
    },

    saveModel(modelName) {
      console.log("works till here!")
      const modelFile = document.getElementById(`textarea-${modelName}-1`).value
      console.log("modelfile here!", modelFile)
      fetch(`/save-model-file/${modelName}`, {
        method: "POST",
        headers: {
          'Accept': 'application/json, text/plain, */*',
          "Content-Type": "application/json",
          "X-CSRFToken": document.cookie.split("=")[1],
        },
        body: JSON.stringify({ modelFile: modelFile }),
      })
      .then(() => {
        console.log("works till here too!")
      })
    },

    deleteModel(modelName) {
      fetch(`/delete-model/${modelName}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": document.cookie.split("=")[1],
        },
      })
        .catch(e => console.error("ERROR:", e))
        .then(() => {
          console.log(`${modelName} deleted!`)
          document.getElementById(modelName).remove()
        })
    },

    renameModel(modelName, newModelName) {
      this.copyModel(modelName, newModelName).then(() => {
        this.deleteModel(modelName)
      })
    },
  }))

  Alpine.data("textareaData", () => ({
    counter: 0,
  }))
})
