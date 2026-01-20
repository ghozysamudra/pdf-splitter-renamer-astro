# PDF Splitter Pro

Split multi-page PDFs locally with private, fast, and secure processing. Built with AstroJS, React, and Tailwind CSS.

## Features

- **Local Processing**: All document manipulation happens in your browser using `pdf-lib` and `pdfjs-dist` powered by WebAssembly. Your files never leave your computer.
- **Flexible Naming**: Name your split files using:
  - Source file name + numbering
  - Custom templates
  - Manual name lists
  - Data from a CSV file
- **Advanced Naming Logic**: 
  - Prefix or suffix numbering
  - Custom start numbers and padding digits
  - CSV header support
- **ZIP Download**: Automatically generates a ZIP file containing all split PDFs.
- **Premium Design**: Modern, responsive interface with glassmorphism aesthetics.

## Tech Stack

- **Framework**: [AstroJS](https://astro.build/)
- **UI Library**: [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **PDF Processing**: [pdf-lib](https://pdf-lib.js.org/), [pdfjs-dist](https://github.com/mozilla/pdf.js)
- **Utilities**: [JSZip](https://stuk.github.io/jszip/), [PapaParse](https://www.papaparse.com/)

## Getting Started

### Prerequisites

- Node.js (v20 or newer recommended)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ghozysamudra/pdf-splitter-renamer-astro.git
   cd pdf-splitter-renamer-astro
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:4321`

### Building for Production

To create a production build:
```bash
npm run build
```

The output will be in the `dist/` directory.

## FAQ

Check out the FAQ section directly in the app for more details on security, use cases, and how to use the tool.

## License

This project is open-source. Vibe coded with ❤️ by [Ghozy Samudra](https://ghozysamudra.com/).
