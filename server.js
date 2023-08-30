const express = require('express');
const multer = require('multer');
const shortid = require('shortid');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const upload = multer({ dest: 'uploads/' });

const uploadedFiles = {};

app.use(express.static('public'));

app.post('/upload', upload.single('file'), (req, res) => {
    const fileId = shortid.generate();
    const originalFileName = req.file.originalname;
    const filePath = path.join(__dirname, 'uploads', req.file.filename);

    uploadedFiles[fileId] = {
        fileName: originalFileName,
        filePath: filePath
    };

    res.json({ fileId });
});

app.get('/download/:fileId', (req, res) => {
    const fileId = req.params.fileId;
    const fileInfo = uploadedFiles[fileId];

    if (fileInfo) {
        const fileName = fileInfo.fileName;
        const filePath = fileInfo.filePath;

        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error('Error sending file:', err);
            }
        });
    } else {
        res.status(404).send('File not found');
    }
});

app.get('/share/:fileId', (req, res) => {
    const fileId = req.params.fileId;
    const fileInfo = uploadedFiles[fileId];

    if (fileInfo) {
        const downloadLink = `${req.protocol}://${req.get('host')}/download/${fileId}`;
        res.send(`Share this link: <a href="${downloadLink}" target="_blank">${downloadLink}</a>`);
    } else {
        res.status(404).send('File not found');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
