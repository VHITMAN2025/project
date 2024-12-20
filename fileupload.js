const http = require('http');
const mysql = require('mysql');
const fs = require('fs');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'HITMAN',
    password: 'HITMAN2025',
    database: 'HITMAN'
});

connection.connect(err => {
    if (err) throw err;
    console.log('Connected to database');

    // Read the PDF file
    fs.readFile('./CSE_R23-MVGRCE_CourseStructure_with_Syllabus.pdf', (err, data) => {
        if (err) throw err;
        const name = 'file.pdf';
        // Insert the file into the database
        const sql = "INSERT INTO pdf_files (name, data) VALUES (?, ?)";
        connection.query(sql, [name, data], (err, result) => {
            if (err) throw err;
            console.log('File inserted');
        });
    });
});

// Create HTTP server
const server = http.createServer((req, res) => {
    console.log(`Received request for ${req.url}`);
    if (req.url === '/') {
        // Serve the HTML file
        fs.readFile('upload.html', (err, data) => {
            if (err) {
                console.error('Error reading upload.html:', err);
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end('Internal Server Error');
                return;
            }
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(data);
        });
    } else if (req.url.startsWith('/view-pdf/')) {
        const fileId = req.url.split('/').pop();
        console.log(`Fetching PDF with id: ${fileId}`);
        const sql = "SELECT name, data FROM pdf_files WHERE id = ?";
        connection.query(sql, [fileId], (err, result) => {
            if (err) {
                console.error('Database query error:', err);
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end('Internal Server Error');
                return;
            }

            if (result.length > 0) {
                const file = result[0];
                res.writeHead(200, {'Content-Type': 'application/pdf'});
                res.end(file.data);
                console.log('PDF sent successfully');
            } else {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.end('File not found');
                console.log('File not found');
            }
        });
    } else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Not Found');
    }
});

// Start the server
server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
