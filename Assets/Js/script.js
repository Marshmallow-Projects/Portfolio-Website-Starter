// Initialize PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

// DOM Elements
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');
const manualForm = document.getElementById('manual-form');
const pdfFileInput = document.getElementById('pdf-file');
const fileNameDisplay = document.getElementById('file-name');
const extractionStatus = document.getElementById('extraction-status');
const extractedDataSection = document.getElementById('extracted-data');
const generateFromPdfBtn = document.getElementById('generate-from-pdf');
const previewSection = document.getElementById('preview-section');
const portfolioPreview = document.getElementById('portfolio-preview');
const downloadBtn = document.getElementById('download-btn');
const regenerateBtn = document.getElementById('regenerate-btn');

// Tab switching functionality
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        
        // Update active tab button
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Show corresponding tab pane
        tabPanes.forEach(pane => pane.classList.remove('active'));
        document.getElementById(`${tabId}-tab`).classList.add('active');
    });
});

// Manual form submission
manualForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(manualForm);
    const portfolioData = Object.fromEntries(formData.entries());
    generatePortfolio(portfolioData);
});

// PDF file handling
pdfFileInput.addEventListener('change', handlePdfUpload);

// Generate from extracted PDF data
generateFromPdfBtn.addEventListener('click', () => {
    const extractedData = {
        name: document.getElementById('extracted-name').value,
        skills: document.getElementById('extracted-skills').value,
        experience: document.getElementById('extracted-experience').value,
        title: '',
        email: '',
        phone: '',
        location: '',
        summary: '',
        education: ''
    };
    generatePortfolio(extractedData);
});

// Download portfolio
downloadBtn.addEventListener('click', downloadPortfolio);

// Regenerate portfolio
regenerateBtn.addEventListener('click', () => {
    previewSection.style.display = 'none';
});

// PDF Upload and Processing
async function handlePdfUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    fileNameDisplay.textContent = `Selected: ${file.name}`;
    extractionStatus.textContent = 'Extracting text from PDF...';
    extractionStatus.className = 'extraction-status';

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }

        const extractedInfo = extractInfoFromText(fullText);
        displayExtractedData(extractedInfo);
        
        extractionStatus.textContent = 'PDF processed successfully!';
        extractionStatus.className = 'extraction-status success';
        
    } catch (error) {
        console.error('Error processing PDF:', error);
        extractionStatus.textContent = 'Error processing PDF. Please try another file.';
        extractionStatus.className = 'extraction-status error';
    }
}

// Extract information from PDF text
function extractInfoFromText(text) {
    const info = {
        name: '',
        skills: [],
        experience: []
    };

    // Extract name (look for patterns like "John Doe" at the beginning)
    const nameMatch = text.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/);
    if (nameMatch) {
        info.name = nameMatch[1];
    }

    // Extract skills (look for common skill patterns)
    const skillKeywords = [
        'javascript', 'python', 'react', 'node', 'java', 'html', 'css',
        'sql', 'mongodb', 'express', 'vue', 'angular', 'typescript',
        'docker', 'aws', 'azure', 'git', 'linux', 'php', 'ruby', 'go',
        'swift', 'kotlin', 'c++', 'c#', 'rust'
    ];
    
    const foundSkills = [];
    skillKeywords.forEach(skill => {
        const regex = new RegExp(`\\b${skill}\\b`, 'gi');
        if (regex.test(text)) {
            foundSkills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
        }
    });
    info.skills = [...new Set(foundSkills)]; // Remove duplicates

    // Extract experience (look for job titles and companies)
    const experiencePatterns = [
        /(?:at|@)\s+([A-Z][a-zA-Z\s&]+)(?:\s+as|\s+-\s+)?\s*([A-Z][a-zA-Z\s]+)/gi,
        /([A-Z][a-zA-Z\s&]+)\s*[-–]\s*([A-Z][a-zA-Z\s]+)/g
    ];
    
    const experiences = new Set();
    experiencePatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            const company = match[1]?.trim();
            const position = match[2]?.trim();
            if (company && position) {
                experiences.add(`${position} at ${company}`);
            }
        }
    });
    info.experience = Array.from(experiences);

    return info;
}

// Display extracted data from PDF
function displayExtractedData(data) {
    document.getElementById('extracted-name').value = data.name;
    document.getElementById('extracted-skills').value = data.skills.join(', ');
    document.getElementById('extracted-experience').value = data.experience.join('\n');
    extractedDataSection.style.display = 'block';
}

// Generate portfolio from data
function generatePortfolio(data) {
    const portfolioHTML = createPortfolioHTML(data);
    portfolioPreview.innerHTML = portfolioHTML;
    previewSection.style.display = 'block';
    
    // Scroll to preview
    previewSection.scrollIntoView({ behavior: 'smooth' });
}

// Create portfolio HTML template
function createPortfolioHTML(data) {
    return `
        <div class="portfolio">
            <header class="portfolio-header">
                <h1><i class="fas fa-user"></i> ${data.name || 'Your Name'}</h1>
                <div class="title">${data.title || 'Professional Title'}</div>
                ${data.email || data.phone || data.location ? `
                <div class="portfolio-contact">
                    ${data.email ? `<i class="fas fa-envelope"></i> ${data.email} • ` : ''}
                    ${data.phone ? `<i class="fas fa-phone"></i> ${data.phone} • ` : ''}
                    ${data.location ? `<i class="fas fa-map-marker-alt"></i> ${data.location}` : ''}
                </div>
                ` : ''}
            </header>

            ${data.summary ? `
            <section class="portfolio-section">
                <h2><i class="fas fa-user-tie"></i> Professional Summary</h2>
                <div class="portfolio-summary">
                    ${data.summary}
                </div>
            </section>
            ` : ''}

            ${data.skills ? `
            <section class="portfolio-section">
                <h2><i class="fas fa-code"></i> Skills</h2>
                <div class="skills-grid">
                    ${data.skills.split(',').map(skill => `
                        <div class="skill-item"><i class="fas fa-star"></i> ${skill.trim()}</div>
                    `).join('')}
                </div>
            </section>
            ` : ''}

            ${data.experience ? `
            <section class="portfolio-section">
                <h2><i class="fas fa-briefcase"></i> Experience</h2>
                ${parseExperience(data.experience).map(exp => `
                    <div class="experience-item">
                        <h3><i class="fas fa-briefcase"></i> ${exp.position}</h3>
                        ${exp.period ? `<div class="period">${exp.period}</div>` : ''}
                        ${exp.achievements ? `
                        <ul>
                            ${exp.achievements.map(achievement => `
                                <li>${achievement}</li>
                            `).join('')}
                        </ul>
                        ` : ''}
                    </div>
                `).join('')}
            </section>
            ` : ''}

            ${data.education ? `
            <section class="portfolio-section">
                <h2><i class="fas fa-graduation-cap"></i> Education</h2>
                ${parseEducation(data.education).map(edu => `
                    <div class="education-item">
                        <h3><i class="fas fa-graduation-cap"></i> ${edu.institution}</h3>
                        <div class="period">${edu.degree} ${edu.period ? `• ${edu.period}` : ''}</div>
                    </div>
                `).join('')}
            </section>
            ` : ''}
        </div>
    `;
}

// Parse experience text into structured data
function parseExperience(experienceText) {
    const experiences = [];
    const lines = experienceText.split('\n');
    let currentExp = null;

    lines.forEach(line => {
        line = line.trim();
        if (!line) return;

        // Check if this is a new experience entry
        const positionMatch = line.match(/^([^-]+?)\s*[-–]\s*(.+)$/);
        const periodMatch = line.match(/\((\d{4}\s*[-–]\s*(?:\d{4}|present))\)$/i);

        if (positionMatch && !line.startsWith('-')) {
            if (currentExp) experiences.push(currentExp);
            currentExp = {
                position: positionMatch[2].trim(),
                company: positionMatch[1].trim(),
                period: periodMatch ? periodMatch[1] : '',
                achievements: []
            };
        } else if (line.startsWith('-') && currentExp) {
            currentExp.achievements.push(line.substring(1).trim());
        } else if (currentExp && !periodMatch) {
            // If it's not a bullet point and not a period, it might be additional info
            currentExp.achievements.push(line);
        }
    });

    if (currentExp) experiences.push(currentExp);
    return experiences;
}

// Parse education text into structured data
function parseEducation(educationText) {
    const education = [];
    const lines = educationText.split('\n');

    lines.forEach(line => {
        line = line.trim();
        if (!line) return;

        const match = line.match(/^([^-]+?)\s*[-–]\s*(.+?)(?:\s*\((\d{4}\s*[-–]\s*(?:\d{4}|present))\))?$/i);
        if (match) {
            education.push({
                institution: match[1].trim(),
                degree: match[2].trim(),
                period: match[3] || ''
            });
        }
    });

    return education;
}

// Download portfolio as HTML file
async function downloadPortfolio() {
    if (!portfolioPreview.innerHTML.trim()) {
        alert('Please generate a portfolio first before downloading.');
        return;
    }

    const portfolioHTML = portfolioPreview.innerHTML;

    // Fetch the CSS content
    let cssContent = '';
    try {
        const response = await fetch('./Assets/CSS/Design.css');
        cssContent = await response.text();
    } catch (error) {
        console.error('Error fetching CSS:', error);
        // Fallback to basic styles if CSS fetch fails
        cssContent = `
            body { font-family: Arial, sans-serif; margin: 20px; }
            .portfolio { max-width: 800px; margin: 0 auto; }
            .portfolio-header { text-align: center; padding: 20px; background: #f0f0f0; margin-bottom: 20px; }
            .portfolio-section { margin-bottom: 20px; }
            .skills-grid { display: flex; flex-wrap: wrap; gap: 10px; }
            .skill-item { background: #e0e0e0; padding: 10px; border-radius: 5px; }
            .experience-item, .education-item { margin-bottom: 15px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        `;
    }

    const fullHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Portfolio - ${document.getElementById('name')?.value || document.getElementById('extracted-name')?.value || 'My Portfolio'}</title>
            <style>
                ${cssContent}
            </style>
        </head>
        <body>
            ${portfolioHTML}
        </body>
        </html>
    `;

    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Initialize the application
function init() {
    console.log('AI Portfolio Generator initialized');
}

// Start the application
init();
