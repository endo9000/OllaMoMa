##  OllaMoMa (Ollama Model Manager)

**A web application for interacting with your Ollama llms!**

This project provides a simple and intuitive way to explore, manage, and interact with your locally stored Ollama models. 

**Features:**

* **Model listing:** View a list of your available models with basic information like name, size, and modification date.
* **Model details:**  Dive deeper into a selected model to see its other relevant details.
* **Model management:** Easily rename, copy, and remove models with simple dialog prompts.
* **Model file view/edit:**  View and edit the model file contents directly within the application. 
* **Save changes:**  Save your modifications to the model file back to disk.
* **Undo changes:** Undo your recent edits to the model file. 

**Getting Started:**

1. **Prerequisites:**
    * Node.js and npm (or yarn) installed on your system.
2. **Installation:**
    * Clone the repository: `git clone https://github.com/endo9000/OllaMoMa`
    * Navigate into the project directory: `cd ollamoma`
    * Install dependencies: `npm install`
3. **Local Server:**
    * Start the development server: `npm run dev`
    * Open your web browser and visit `http://localhost:4000`
4. **Alternative Method (No Build Required):**
    * Download the `ollamoma.zip` file from the repository
    * Unzip the file to a directory of your choice
    * Use a web server of your choice (e.g. IIS, Apache, Python's `http.server`) to serve the unzipped files
    * Open your web browser and visit the URL of your chosen web server


**Configuration:**

To use a different port, just update the "dev" script in the package.json file. For example, change it to "dev": "vite --port 5000" to use port 5000 instead of the default port 4000.

**Contributing:**

Contributions are welcome! Please follow the guidelines in the `CONTRIBUTING.md` file.

**License:**

This project is licensed under the MIT License - see the `LICENSE` file for details.

**Disclaimer:**

This application is intended for educational purposes only. Use it responsibly and be aware of the potential risks associated with modifying your model files.

If you got any questions about this web application you can find me in Ollama's discord server. Feel free to join us. [Ollama Discord](https://discord.gg/ollama)