const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { google } = require('googleapis');

const app = express();
const port = 7000;

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
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>File Upload and Download</title>
            <link rel="stylesheet" type="text/css" href="style.css">
            <style>
                /* Style for the links */
                .link {
                    font-size: 16px;
                    margin-right: 10px; /* Add margin to the right of each link */
                }
    
                .link:last-child {
                    margin-right: 0; /* Remove margin from the last link */
                }
    
                .download-link, .view-link, .copy-link {
                    display: inline-block;
                    margin-top: 5px;
                    color: #007bff;
                    text-decoration: none;
                    padding: 5px 10px;
                    border: 1px solid #007bff;
                    border-radius: 5px;
                    transition: background-color 0.3s, color 0.3s;
                }
    
                .download-link:hover, .view-link:hover, .copy-link:hover {
                    background-color: #007bff;
                    color: white;
                }
            </style>
            <script>
                function copyToClipboard(text) {
                    const tempInput = document.createElement('input');
                    tempInput.value = text;
                    document.body.appendChild(tempInput);
                    tempInput.select();
                    document.execCommand('copy');
                    document.body.removeChild(tempInput);
                }
            </script>
        </head>
        <body>
            <div class="main">
                <h1>File uploaded Successfully</h1>
                <a class="link download-link" href="${publicDownloadLink}" download>Direct Download Link</a>
                <a class="link view-link" href="${publicViewLink}" target="_blank">View Download Link</a>
                <a class="link copy-link" href="javascript:void(0);" onclick="copyToClipboard('${publicDownloadLink}')">Copy Link</a>
            </div>
        </body>
        </html>
    `);
    
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Error uploading and generating links.');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
 