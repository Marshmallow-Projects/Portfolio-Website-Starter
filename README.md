# AI Portfolio Generator

A web-based tool that automatically generates professional portfolio websites from manual input or by extracting information from PDF CV files.

## Features

- **Manual Input**: Fill out a comprehensive form with your personal and professional information
- **PDF Processing**: Upload your CV PDF and automatically extract key information
- **Real-time Preview**: See your portfolio generated instantly
- **Download**: Get a complete HTML file of your portfolio website
- **Responsive Design**: Works on desktop and mobile devices

## How to Use

### Manual Input Method
1. Open `index.html` in your web browser
2. Select the "Manual Input" tab
3. Fill in your details:
   - Full Name (required)
   - Professional Title
   - Contact Information
   - Professional Summary
   - Skills (comma-separated)
   - Experience (formatted with bullet points)
   - Education
4. Click "Generate Portfolio"
5. Preview your portfolio and click "Download Portfolio" to save it

### PDF Upload Method
1. Select the "Upload PDF" tab
2. Click to choose a PDF file of your CV
3. Wait for the AI to extract information
4. Review and edit the extracted data if needed
5. Click "Generate Portfolio"
6. Download your completed portfolio

## Technical Details

- Uses **PDF.js** for PDF text extraction
- Pure HTML, CSS, and JavaScript (no frameworks required)
- Responsive design with CSS Grid and Flexbox
- Client-side processing (no server required)

## Browser Support

Works in all modern browsers that support:
- File API
- PDF.js library
- ES6+ JavaScript features

## Customization

You can customize the portfolio template by modifying the `createPortfolioHTML` function in `script.js` and the CSS styles in `styles.css`.

## License

This project is open source and available under the MIT License.
