# makeO toothsi Production Analyzer 🦷

A fast, fully client-side Next.js web application designed to help production teams analyze and identify missing aligner cases across different stages of manufacturing (Shelling & Printing).

## Features ✨

- **Lightning Fast**: Built with Next.js App Router and Turbopack.
- **100% Client-Side Processing**: Excel files are parsed locally in your browser using the `xlsx` library—no server uploads, no privacy concerns, zero database overhead.
- **Shelling Missing Analyzer**: Cross-references completed backlog UIDs against the Shelling Dashboard to find cases that were marked done but are missing.
- **Printing Missing Analyzer**: Compares the monthly print backlog with the Printing Dashboard.
- **Export to Excel**: Generates clean, ready-to-share Excel reports of missing cases instantly.
- **Modern UI**: Styled beautifully with Tailwind CSS and sleek animations.

## Technologies Used 💻

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **XLSX** (SheetJS)
- **Lucide React**

## Getting Started 🚀

1. **Clone the repository**
   ```bash
   git clone https://github.com/surajpsharma/production-analyzer.git
   cd production-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

## Usage 🛠️

1. Navigate to either **Shelling Missing** or **Printing Missing** from the homepage.
2. Upload the **Monthly Backlog** `.xlsx` file.
3. Upload the **Dashboard** `.xlsx` file.
4. Set the **Date** and **Prepared By** filters.
5. Click **Run Analysis**.
6. View the summary and download the generated missing cases report!

## Author 👤

**Suraj Sharma**
- GitHub: [@surajpsharma](https://github.com/surajpsharma)
- Instagram: [__suraj__sharma____](https://www.instagram.com/__suraj__sharma____)
- Email: surajsharma030805@gmail.com
