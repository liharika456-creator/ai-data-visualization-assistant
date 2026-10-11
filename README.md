# AI Data Visualization Assistant 📊🤖

**GenAI Internship Project** &bull; Interactive Exploratory Data Analysis & Visualization Dashboard

A clean, modern, beginner-friendly web application designed to help users upload CSV files, automatically compute statistical summaries, visualize metrics with interactive charts, and receive transparent, plain-English data insights.

---

## 🌟 Key Features

1. **Modern, Responsive Dashboard**
   - Clean slate-and-navy aesthetic with a dedicated navigation sidebar, summary KPI cards, chart canvas studio, insights panel, and data explorer.
   - Fully responsive across desktop monitors, laptops, tablets, and smartphones.

2. **Client-Side CSV Parsing & Ingestion**
   - Drag-and-drop or file picker upload for `.csv` files.
   - Powered by [PapaParse](https://www.papaparse.com/) to reliably handle quoted commas, special characters, whitespace, and currency symbols (`$`, `€`, `₹`, `%`).
   - Intelligent column type inference (`numeric`, `categorical`, `date`).

3. **1-Click Sample Datasets**
   - Test the application instantly without uploading your own file:
     - **Global Sales & Revenue**: 20 rows of regional products, pricing, costs, and profits.
     - **Tech Salaries & Roles**: 15 rows of job titles, experience, salaries, and performance scores.

4. **Interactive Chart Studio (Chart.js)**
   - **Supported Chart Types**:
     - Vertical Bar Chart
     - Horizontal Bar Chart
     - Line Chart (Trend & Progression)
     - Pie Chart (Proportions & Shares)
     - Doughnut Chart
   - **Customizable Aggregation**:
     - Sum (Total)
     - Mean (Average)
     - Count (Frequency)
     - Maximum
     - Minimum
   - **Data Ordering**: Descending, Ascending, Alphabetical, or Original.
   - **Top N Filtering**: Display Top 5, Top 10, Top 15, or All items (prevents overcrowded pie charts).
   - **One-Click Export**: Save generated charts as high-resolution `.png` images.

5. **Automated Algorithmic Insights Engine**
   - Generates transparent, rule-based observations in plain English:
     - 🏆 **Top Performers & Extremes**: Detects leaders and compares highest vs. lowest categories.
     - 📈 **Trend & Correlation Signals**: Computes Pearson correlation coefficients (\(r\)) between numeric attributes.
     - 🥧 **Pareto & Concentration**: Analyzes whether top categories dominate total volume.
     - ⚠️ **Variance & Outliers**: Identifies standard deviation, dispersion, and points deviating beyond \(2\sigma\).
     - 🛡️ **Data Health & Completeness**: Highlights missing values, null rates, and tabular hygiene.
   - *Honest & Reliable*: Grounded in real statistical formulas without hallucinations or fake AI claims.

6. **Comprehensive Numeric Statistics Matrix**
   - Detailed quantitative table calculating:
     - Non-null Count
     - Sum
     - Mean (Average)
     - Median
     - Minimum & Maximum
     - Range (\(\text{Max} - \text{Min}\))
     - Standard Deviation (\(\sigma\))
     - Missing / Null count

7. **Interactive Data Table Explorer**
   - Real-time search across all columns.
   - Sortable columns (click any header to toggle ascending/descending order).
   - Configurable pagination (10, 25, 50, 100 rows per page).
   - Datatype badges (`# Numeric`, `Aa Text`, `📅 Date`).

8. **Contextual Validation & Error Prevention**
   - Rejects non-CSV files with helpful guidance.
   - Detects empty files and header-only datasets.
   - Dynamically warns when pie charts are selected for categories with high cardinality.

---

## 📂 Project Structure

```text
aii_data_visualization_assistant/
│
├── index.html                 # Main dashboard markup, layout structure & UI controls
├── styles.css                 # Modern CSS styles, layout grid, color system, and responsive breakpoints
├── app.js                     # Complete application logic: CSV parser, stats engine, Chart.js, insights
├── sample_sales_data.csv      # Sample retail sales & profit dataset for offline testing
├── sample_employee_data.csv   # Sample tech salaries and roles dataset for offline testing
└── README.md                  # Project documentation & run guide
```

### Explanation of Files

- **`index.html`**:
  Contains the semantic structure of the dashboard, including the sidebar, upload dropzone, sample dataset selector, topbar with active status pill, KPI summary cards, Chart Studio container, insights grid, statistics matrix, and the paginated table explorer.

- **`styles.css`**:
  Implements modern CSS variables for a dark/slate sidebar paired with a clean, high-contrast dashboard surface. Includes micro-interactions, responsive flex/grid layouts, custom tables with sticky headers, and mobile drawer transitions.

- **`app.js`**:
  Handles the complete client-side lifecycle:
  - Manages application state (`rows`, `headers`, `columnTypes`, `numericStats`, `chartInstance`).
  - Executes CSV parsing using PapaParse.
  - Automatically identifies data types and cleans currency/comma-formatted numbers.
  - Computes comprehensive summary statistics (mean, median, standard deviation, outliers).
  - Renders and updates Chart.js instances cleanly with canvas recycling.
  - Generates factual plain-English insights based on mathematical calculations.
  - Powers real-time table searching, column sorting, and pagination.

- **`sample_sales_data.csv` & `sample_employee_data.csv`**:
  Standard CSV files that can be uploaded directly to test the application or referenced during live presentations.

---

## 🚀 How to Run the Project Locally

Because this project is built with clean vanilla HTML, CSS, and JavaScript using trusted CDNs (Chart.js and PapaParse), you can run it immediately without complex build setups or installations.

### Option 1: Using Python's Built-in Server (Recommended)

1. Open PowerShell or Command Prompt in the project folder:
   ```powershell
   cd c:\Users\91970\Desktop\aii_data_visualization_assistant
   ```
2. Start the local server:
   ```bash
   python -m http.server 8000
   ```
3. Open your browser and navigate to:
   ```text
   http://localhost:8000
   ```

### Option 2: Using VS Code Live Server Extension

1. Open the project folder in **Visual Studio Code**.
2. Install the **Live Server** extension (by Ritwick Dey).
3. Right-click on `index.html` and select **"Open with Live Server"**.

### Option 3: Direct Browser Launch

Double-click `index.html` or drag it into any modern web browser (Google Chrome, Microsoft Edge, Firefox, or Safari).

---

## 🧪 Testing the Application

1. **Load Sample Data**:
   - Click the **"Quick Sample"** button in the top navbar or **"Load Sample Data"** in the sidebar.
   - Verify that all KPI cards update, charts render immediately, insights populate, and the data table shows the 20 rows.
2. **Experiment with Chart Controls**:
   - Change the **Chart Type** (e.g., from Bar to Pie or Line).
   - Change the **Aggregation Method** (e.g., Sum vs. Average).
   - Switch the **X-Axis** (e.g., `Item_Type` or `Region`) and **Y-Axis** (e.g., `Total_Profit` or `Units_Sold`).
   - Click **"Save Chart Image"** to verify that a PNG download is triggered.
3. **Test Custom CSV Upload**:
   - Drag and drop `sample_employee_data.csv` into the sidebar drop zone.
   - Observe automatic recalculation of stats, dynamic column updates in the dropdowns, and new insights.
4. **Test Table Interactivity**:
   - Type a query like `"Smartphones"` or `"Developer"` into the search bar.
   - Click column headers to test ascending and descending sort orders.
   - Switch rows-per-page from `10` to `25`.

---

## 💡 Internship Project Notes & Future GenAI Roadmap

- **Current Implementation**:
  Operates on a pure, reliable rule-based statistical foundation. Every metric, correlation, and insight is mathematically computed directly on the user's data with zero hallucination.
- **GenAI Extension Roadmap**:
  In a production or advanced phase of the internship, this architecture is primed to integrate an LLM (e.g., Gemini 1.5 / 2.0 API):
  1. The computed statistical summaries from `app.js` can be formatted into a compact prompt payload.
  2. The LLM can answer open-ended conversational questions (e.g., *"What pricing strategy should we apply to low-margin items?"*).
  3. The LLM can generate automated executive summaries based on the exact numbers calculated here.
