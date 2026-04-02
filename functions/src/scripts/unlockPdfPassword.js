import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { PDFDocument  } from 'pdf-lib';

const pdfFolder = path.join(__dirname, "pdfs");
const outputFolder = path.join(__dirname, "unlocked_pdfs");
const outfileName = "output_unlocked.pdf";
const passwordListPath = path.join(__dirname, "passwords.txt");
const outputPath = path.join(outputFolder, outfileName);
import { execFile } from "child_process";

function unlockPdf(filePath, outputPath, passwordListPath) {
    return new Promise((resolve, reject) => {

        const startDate = new Date(1963, 0, 1); // 01-01-1963
        const endDate   = new Date(1964, 0, 1); // 01-01-1964

        function tryPassword(d) {
            if (d > endDate) {
                return reject(new Error("Password not found"));
            }

            const day   = String(d.getDate()).padStart(2, "0");
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const year  = d.getFullYear();

            const password = `${day}${month}${year}`;
            const options = [
                `--password=${password}`,
                "--decrypt",
                filePath,
                outputPath
            ];

            execFile("qpdf", options, (error) => {
                if (!error) {
                    console.log("Unlocked with password:", password);
                    fs.appendFileSync(passwordListPath,`${path.basename(filePath)} => ${password}\n`);

                    return resolve({
                        file: path.basename(filePath),
                        unlockedPath: outputPath,
                        password
                    });
                }
                d.setDate(d.getDate() + 1);
                tryPassword(d);
            });
        }

        tryPassword(new Date(startDate));
    });
}


const unlockPdfDocument = async () => { 
    try {
        const files = fs.readdirSync(pdfFolder).filter(f => f.endsWith(".pdf"));
        let finalResult = [];
        for (const file of files) {
            const filePath = path.join(pdfFolder, file);

            try {
                const result = await unlockPdf(filePath, outputPath, passwordListPath);
                console.log(`Successfully unlocked ${file}:`, result);
                finalResult = result;

            } catch (err) {
                console.error("Failed for", file, err.message);
            }
        }
        return finalResult;
    } catch (error) {
        console.log(`Failed to unlocked: ${error}`);
        return error;
    }
}

export { unlockPdfDocument };
