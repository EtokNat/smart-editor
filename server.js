import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Allow large images

app.post('/convert', (req, res) => {
    const { html } = req.body;
    
    // Define file paths
    const inputPath = path.join(__dirname, 'temp_input.html');
    const outputPath = path.join(__dirname, 'MathNotes.docx');

    // 1. Save HTML to a temp file
    try {
        fs.writeFileSync(inputPath, html);
    } catch (err) {
        console.error("File write error:", err);
        return res.status(500).send("Server file error");
    }

    // 2. Run Pandoc
    // FIX APPLIED: We use "-f html" (Pandoc reads MathML automatically in HTML mode)
    const command = `pandoc "${inputPath}" -o "${outputPath}" -f html -t docx --standalone`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Pandoc Error: ${error.message}`);
            return res.status(500).send('Conversion failed');
        }

        // 3. Send file back to frontend
        if (fs.existsSync(outputPath)) {
            res.download(outputPath, 'MathNotes.docx', (err) => {
                if (err) console.error("Download error:", err);
                
                // Cleanup temp files after sending
                setTimeout(() => {
                    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                }, 1000);
            });
        } else {
            res.status(500).send("Output file not found");
        }
    });
});

app.listen(3001, () => {
    console.log('Conversion server running on http://localhost:3001');
});
