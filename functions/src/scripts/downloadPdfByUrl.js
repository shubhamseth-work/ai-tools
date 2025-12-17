import fs from 'fs';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const baseUrl = "https://www.eci.gov.in/eci-backend/public/ER/s04/06%20Vaishali/06%20Vaishali/06%20Vaishali_A051_A0510";
const eciFolderPath = 'A052_A0510';
const districtCode = 'A052';
const assemblyCode = 'A0510';
const baseUrl = `https://www.eci.gov.in/eci-backend/public/ER/s04/06%20Vaishali/06%20Vaishali/06%20Vaishali_${eciFolderPath}`;
const downloadFolder = path.join(__dirname, "pdfs");
const folderName= "A52_Vaisahali_PDFs";
const finalFolderPath = path.join(downloadFolder, folderName);
console.log('Download folder path:', finalFolderPath);

// Sleep function (5 seconds)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const downloadPdfFromUrl = async (req, res) => {
    if (!fs.existsSync(finalFolderPath)) {
        fs.mkdirSync(finalFolderPath);
    }
    try {
        for (let i = 1; i <= 230; i++) {
            const num = i.toString().padStart(3, "0"); // 001, 002, ..., 230
            const fileName = `${eciFolderPath}${num}.pdf`;
            const url = `${baseUrl}${num}.pdf`;
            console.log(`Downloading: ${url}`);

            const response = await axios({
                url,
                method: "GET",
                responseType: "stream"
            });

            const filePath = path.join(finalFolderPath, fileName);
            const writer = fs.createWriteStream(filePath);

            response.data.pipe(writer);

            // Wait for file to finish writing
            await new Promise((resolve, reject) => {
                writer.on("finish", resolve);
                writer.on("error", reject);
            });

            console.log(`Saved → ${filePath}`);
            console.log("Waiting 5 seconds...");
            await delay(5000);
        }
        return finalFolderPath;
    } catch (error) {
        console.log(`Failed to download: ${error}`);
    }
}


export { downloadPdfFromUrl };