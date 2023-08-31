const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { google } = require('googleapis');

const app = express();
const port = 3000;

const oAuth2Client = new google.auth.OAuth2(
    "688965129705-tjcogrfn14ugcph87qoi59m3lumd2pa8.apps.googleusercontent.com",
    "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",
    "https://test-psi-seven-55.vercel.app/callback"
);

app.use(express.static('public'));

// Set up file upload using Multer
const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });

// Authenticate and authorize the client
async function authorize() {
    const credentials = await fs.promises.readFile('token.json');
    oAuth2Client.setCredentials(JSON.parse(credentials));
}

// Upload a file to Google Drive and set its permissions to public
async function uploadFile(file) {
    try {
        const drive = google.drive({ version: 'v3', auth: oAuth2Client });

        const fileMetadata = {
            name: file.originalname,
        };
        const media = {
            mimeType: file.mimetype,
            body: fs.createReadStream(`./uploads/${file.filename}`),
        };

        const uploadedFile = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id',
        });

        // Set the uploaded file's permissions to public
        await drive.permissions.create({
            fileId: uploadedFile.data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        console.log(`File uploaded with ID: ${uploadedFile.data.id}`);
        return uploadedFile.data.id; // Return the uploaded file ID
    } catch (err) {
        console.error('Error uploading file:', err);
        throw err;
    }
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        await authorize();
        const uploadedFileId = await uploadFile(req.file);

        const publicDownloadLink = `https://drive.google.com/uc?id=${uploadedFileId}`;
        const publicViewLink = `https://drive.google.com/file/d/${uploadedFileId}/view?usp=sharing`;

        res.send(`
            File uploaded to Google Drive!<br>
            <a href="${publicDownloadLink}" download>Public Download Link</a><br>
            <a href="${publicViewLink}" target="_blank">Public View Link</a>
        `);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Error uploading and generating links.');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
