const { mdToPdf } = require('md-to-pdf');
const path = require('path');
const fs = require('fs');

async function generatePDFs() {
  console.log('Generating PDFs...\n');

  const files = [
    { input: 'TECHNICAL_REPORT.md', output: 'TECHNICAL_REPORT.pdf' },
    { input: 'PRESENTATION.md', output: 'PRESENTATION.pdf' },
    { input: 'COLLABORATION_GUIDE.md', output: 'COLLABORATION_GUIDE.pdf' }
  ];

  for (const file of files) {
    const inputPath = path.join(process.cwd(), file.input);
    const outputPath = path.join(process.cwd(), file.output);

    if (!fs.existsSync(inputPath)) {
      console.log(`Skipping ${file.input} - file not found`);
      continue;
    }

    try {
      console.log(`Converting ${file.input}...`);
      
      const pdf = await mdToPdf(
        { path: inputPath },
        {
          dest: outputPath,
          launch_options: {
            args: ['--no-sandbox', '--disable-setuid-sandbox']
          },
          pdf_options: {
            format: 'A4',
            margin: {
              top: '20mm',
              bottom: '20mm',
              left: '20mm',
              right: '20mm'
            },
            printBackground: true
          },
          stylesheet: null,
          css: `
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
              font-size: 11pt;
              line-height: 1.6;
              color: #333;
            }
            h1 {
              color: #1a1a2e;
              border-bottom: 2px solid #4a4a8a;
              padding-bottom: 8px;
              margin-top: 24px;
            }
            h2 {
              color: #2a2a4a;
              border-bottom: 1px solid #ddd;
              padding-bottom: 6px;
              margin-top: 20px;
            }
            h3 {
              color: #3a3a5a;
              margin-top: 16px;
            }
            h4 {
              color: #4a4a6a;
              margin-top: 12px;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 16px 0;
              font-size: 10pt;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px 12px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
              font-weight: 600;
            }
            tr:nth-child(even) {
              background-color: #fafafa;
            }
            code {
              background-color: #f4f4f4;
              padding: 2px 6px;
              border-radius: 3px;
              font-family: 'Consolas', 'Monaco', monospace;
              font-size: 9pt;
            }
            pre {
              background-color: #f4f4f4;
              padding: 12px;
              border-radius: 6px;
              overflow-x: auto;
              font-size: 9pt;
            }
            pre code {
              padding: 0;
              background: none;
            }
            blockquote {
              border-left: 4px solid #4a4a8a;
              margin: 16px 0;
              padding-left: 16px;
              color: #666;
            }
            hr {
              border: none;
              border-top: 1px solid #ddd;
              margin: 24px 0;
            }
            ul, ol {
              padding-left: 24px;
            }
            li {
              margin: 4px 0;
            }
            strong {
              color: #1a1a2e;
            }
            a {
              color: #4a4a8a;
              text-decoration: none;
            }
            @media print {
              h1 { page-break-before: auto; }
              h2 { page-break-after: avoid; }
              table { page-break-inside: avoid; }
              pre { page-break-inside: avoid; }
            }
          `
        }
      );

      if (pdf) {
        console.log(`  Created: ${file.output}`);
      }
    } catch (error) {
      console.error(`  Error converting ${file.input}:`, error.message);
    }
  }

  console.log('\nPDF generation complete!');
}

generatePDFs().catch(console.error);
