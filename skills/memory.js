const fs = require("fs")
const path = require('path')

const MEMORY_FILE = path.join(__dirname, "../memory/context.md")

if (!fs.existsSync(MEMORY_FILE)) {
    fs.writeFileSync(MEMORY_FILE, "# Mango Core Memory\n\n", 'utf-8')
}

const readMemory = () => {
    try {

        return fs.readFileSync(MEMORY_FILE, 'utf-8')

    } catch (error) {
        return `Memory File Error.`
    }
}

const saveMemory = (newFact) => {
    const timestamp = new Date().toLocaleString();
    const formattedFact = `[${timestamp}] ${newFact}\n`;

    fs.appendFileSync(MEMORY_FILE, formattedFact, 'utf-8');
    return "Successfully saved the memory."
}

module.exports = { readMemory, saveMemory }