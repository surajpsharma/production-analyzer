<div align="center">
  <h1>🚀 makeO toothsi Production Analyzer</h1>
  <p>
    <strong>Enterprise-grade, client-side data reconciliation for manufacturing pipelines.</strong>
  </p>
  <p>
    <a href="https://production-analyzer-kvj3.vercel.app/" target="_blank">View Live Demo</a>
    ·
    <a href="https://github.com/surajpsharma/production-analyzer/issues">Report Bug</a>
    ·
    <a href="https://github.com/surajpsharma/production-analyzer/issues">Request Feature</a>
  </p>
</div>

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-success?style=for-the-badge&logo=vercel" alt="Vercel" />
</div>

<br />

## 📖 About The Project

In high-throughput manufacturing pipelines (like aligner production), maintaining synchronization between daily backlogs and live dashboard reporting is critical. The **makeO toothsi Production Analyzer** is an enterprise-grade utility built to instantly cross-reference bulk Excel reports, identifying "Missing Cases" that have stalled between production stages. 

By migrating this previously manual and error-prone python-script task to a **100% client-side web application**, production teams can now reconcile thousands of UID records in milliseconds—with zero data privacy concerns.

### 🔒 Data Privacy & Security Architecture
This application is strictly **Serverless & Database-Free**. All data processing, Excel parsing, and UID cross-referencing happens directly within the user's browser via the local V8 JavaScript engine. 
- **Zero Data Retention:** No UIDs, employee names, or production metrics are ever transmitted to a backend server.
- **Compliance Ready:** Safe for handling sensitive internal manufacturing data on corporate networks.

---

## ✨ Core Capabilities

* **⚡ Ultra-Fast Reconciliation:** Analyzes and matches massive Excel datasets (`.xlsx`, `.csv`) instantly using the SheetJS processing engine.
* **🔍 Shelling & Printing Workflows:** Built-in contextual analysis modes specifically designed for *Shelling Missing* and *Printing Missing* production blockers.
* **📊 Dynamic Error Reporting:** Generates comprehensive missing case reports with detailed metadata (Prepared By, UID, Date) for immediate action.
* **📥 One-Click Export:** Instantly download cleaned, formatted Excel reports of identified missing cases to share with shift managers.

---

## 🛠️ Tech Stack

This project is built using modern web standards to guarantee performance, type safety, and scalability.

* **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Turbopack)
* **UI Library:** [React 19](https://react.dev/)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Data Processing:** [SheetJS (xlsx)](https://sheetjs.com/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Deployment:** [Vercel](https://vercel.com/)

---

## 🚀 Getting Started

### Prerequisites
Ensure you have the latest stable version of Node.js installed.
* Node.js (v18.17.0 or higher)
* npm (v9.0.0 or higher)

### Local Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/surajpsharma/production-analyzer.git
   cd production-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   *Note: If you encounter peer dependency warnings due to React 19, use `npm install --legacy-peer-deps`.*

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 💻 Usage Workflow

1. **Select Pipeline Stage:** From the dashboard, select either **Shelling Missing** or **Printing Missing**.
2. **Upload Datasets:** 
   - Upload the **Monthly Backlog** Excel file.
   - Upload the target **Dashboard** Excel file.
3. **Configure Parameters:** Enter the specific *Printing Done Date* and *Prepared By* metrics to filter the analysis scope.
4. **Execute Analysis:** Click "Run Analysis". The engine will parse the sheets, filter by date, cross-reference UIDs, and output the missing discrepancies.
5. **Export & Share:** Review the generated table and click **Export Report (.xlsx)** to download the findings.

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👤 Contact

**Suraj Sharma**

* **GitHub:** [@surajpsharma](https://github.com/surajpsharma)
* **Instagram:** [__suraj__sharma____](https://www.instagram.com/__suraj__sharma____)
* **Email:** surajsharma030805@gmail.com

Project Link: [https://github.com/surajpsharma/production-analyzer](https://github.com/surajpsharma/production-analyzer)
