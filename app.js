/**
 * AI Data Visualization Assistant - Application Logic
 * GenAI Internship Project
 *
 * Core Features:
 * 1. Fast client-side CSV parsing with PapaParse
 * 2. Automated data type inference (numeric, date, categorical)
 * 3. Statistical metrics engine (Mean, Median, Std Dev, Min, Max, Nulls)
 * 4. Interactive Chart Studio with Chart.js (Bar, Horizontal Bar, Line, Pie, Doughnut)
 * 5. Rule-based Plain-English Data Insights Engine
 * 6. Interactive Table with search, sorting, and pagination
 * 7. Contextual error handling and validation warnings
 */

(function () {
  'use strict';

  // ==========================================================================
  // Global Application State
  // ==========================================================================
  const state = {
    rawCsvText: '',
    fileName: '',
    fileSize: 0,
    headers: [],
    rows: [],
    columnTypes: {}, // { colName: 'numeric' | 'categorical' | 'date' }
    numericStats: {}, // { colName: { count, sum, mean, median, min, max, range, stdDev, nulls } }
    
    // Chart Studio State
    chartInstance: null,
    chartConfig: {
      type: 'bar',
      xAxis: '',
      yAxis: '',
      aggregation: 'sum',
      sortOrder: 'desc',
      topN: '10'
    },

    // Table State
    table: {
      currentPage: 1,
      pageSize: 10,
      searchTerm: '',
      sortColumn: null,
      sortDirection: 'asc',
      filteredRows: []
    }
  };

  // Color Palette for Chart.js
  const CHART_PALETTE = [
    '#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899',
    '#8b5cf6', '#3b82f6', '#14b8a6', '#f97316', '#6366f1',
    '#0284c7', '#84cc16', '#e11d48', '#a855f7', '#64748b'
  ];

  // ==========================================================================
  // Sample Datasets (Embedded for instant 1-click testing)
  // ==========================================================================
  const SAMPLE_DATASETS = {
    sales: {
      fileName: 'sample_sales_data.csv',
      data: `Region,Country,Item_Type,Sales_Channel,Order_Priority,Units_Sold,Unit_Price,Unit_Cost,Total_Revenue,Total_Cost,Total_Profit
North America,United States,Laptops,Online,High,420,1200.00,800.00,504000.00,336000.00,168000.00
Europe,Germany,Smartphones,Offline,Medium,780,850.00,550.00,663000.00,429000.00,234000.00
Asia,Japan,Smartphones,Online,High,950,850.00,550.00,807500.00,522500.00,285000.00
Europe,France,Monitors,Online,Low,310,320.00,210.00,99200.00,65100.00,34100.00
North America,Canada,Laptops,Offline,Medium,290,1200.00,800.00,348000.00,232000.00,116000.00
Asia,India,Accessories,Online,High,1450,45.00,22.00,65250.00,31900.00,33350.00
Asia,Singapore,Tablets,Online,Critical,510,550.00,360.00,280500.00,183600.00,96900.00
Europe,United Kingdom,Laptops,Online,High,630,1200.00,800.00,756000.00,504000.00,252000.00
North America,United States,Monitors,Offline,Low,410,320.00,210.00,131200.00,86100.00,45100.00
Europe,Spain,Smartphones,Offline,Medium,540,850.00,550.00,459000.00,297000.00,162000.00
Asia,Japan,Tablets,Offline,Low,380,550.00,360.00,209000.00,136800.00,72200.00
North America,Mexico,Accessories,Online,Medium,890,45.00,22.00,40050.00,19580.00,20470.00
Europe,Italy,Accessories,Offline,Low,620,45.00,22.00,27900.00,13640.00,14260.00
Asia,India,Smartphones,Online,Critical,1200,850.00,550.00,1020000.00,660000.00,360000.00
Europe,Germany,Laptops,Online,High,510,1200.00,800.00,612000.00,408000.00,204000.00
North America,United States,Tablets,Offline,Medium,470,550.00,360.00,258500.00,169200.00,89300.00
Asia,South Korea,Monitors,Online,High,720,320.00,210.00,230400.00,151200.00,79200.00
Europe,Netherlands,Tablets,Online,Low,290,550.00,360.00,159500.00,104400.00,55100.00
North America,Canada,Accessories,Offline,Medium,750,45.00,22.00,33750.00,16500.00,17250.00
Asia,Singapore,Laptops,Online,Critical,390,1200.00,800.00,468000.00,312000.00,156000.00`
    },
    employees: {
      fileName: 'sample_employee_data.csv',
      data: `Employee_ID,Name,Department,Job_Title,Years_Experience,Monthly_Salary,Performance_Score,Projects_Completed,Remote_Status
EMP101,Aarav Sharma,Engineering,Backend Developer,4,85000,4.6,12,Hybrid
EMP102,Sophia Chen,Data Science,Data Analyst,2,68000,4.2,8,Remote
EMP103,Marcus Vance,Product,Product Manager,7,115000,4.8,16,On-site
EMP104,Elena Rostova,Engineering,Frontend Developer,3,75000,4.4,10,Hybrid
EMP105,Devon Taylor,Marketing,Growth Marketer,5,72000,3.9,14,Remote
EMP106,Priya Patel,Data Science,ML Engineer,5,108000,4.9,15,Hybrid
EMP107,Lucas Silva,Sales,Account Executive,4,65000,4.1,22,Remote
EMP108,Amara Okafor,Design,UI/UX Designer,3,70000,4.5,11,Hybrid
EMP109,Liam O'Connor,Engineering,DevOps Engineer,6,98000,4.7,13,On-site
EMP110,Yuki Tanaka,Product,Associate PM,2,62000,4.0,7,Remote
EMP111,Fatima Al-Mansoor,Engineering,Backend Developer,5,92000,4.7,14,Hybrid
EMP112,Noah Miller,Sales,Sales Director,9,135000,4.8,29,On-site
EMP113,Chloe Martin,Marketing,Content Strategist,3,58000,3.8,9,Remote
EMP114,Vikram Sethi,Data Science,Senior Data Scientist,8,128000,4.9,18,Hybrid
EMP115,Isabella Rossi,Design,Lead Product Designer,6,96000,4.6,12,On-site`
    }
  };

  // ==========================================================================
  // DOM Elements
  // ==========================================================================
  const elements = {
    // Layout & Navigation
    sidebar: document.getElementById('sidebar'),
    sidebarOpenBtn: document.getElementById('sidebarOpenBtn'),
    sidebarCloseBtn: document.getElementById('sidebarCloseBtn'),
    navLinks: document.querySelectorAll('.nav-link'),
    alertContainer: document.getElementById('alertContainer'),
    emptyStateHero: document.getElementById('emptyStateHero'),
    dashboardContent: document.getElementById('dashboardContent'),

    // File Upload & Sample Controls
    dropZone: document.getElementById('dropZone'),
    csvFileInput: document.getElementById('csvFileInput'),
    sampleDatasetSelect: document.getElementById('sampleDatasetSelect'),
    loadSampleBtn: document.getElementById('loadSampleBtn'),
    topLoadSampleBtn: document.getElementById('topLoadSampleBtn'),
    heroSampleBtn: document.getElementById('heroSampleBtn'),
    activeFileMeta: document.getElementById('activeFileMeta'),
    activeFileName: document.getElementById('activeFileName'),
    activeFileSize: document.getElementById('activeFileSize'),
    resetDataBtn: document.getElementById('resetDataBtn'),
    datasetStatusPill: document.getElementById('datasetStatusPill'),
    statusText: document.getElementById('statusText'),
    exportChartBtn: document.getElementById('exportChartBtn'),
    downloadChartBtn: document.getElementById('downloadChartBtn'),

    // KPI Summary
    overviewFileTag: document.getElementById('overviewFileTag'),
    kpiRows: document.getElementById('kpiRows'),
    kpiCols: document.getElementById('kpiCols'),
    kpiNumericCols: document.getElementById('kpiNumericCols'),
    kpiCategoryCols: document.getElementById('kpiCategoryCols'),
    kpiMissingCells: document.getElementById('kpiMissingCells'),
    kpiCompleteness: document.getElementById('kpiCompleteness'),

    // Chart Studio
    chartTypeSelect: document.getElementById('chartTypeSelect'),
    xAxisSelect: document.getElementById('xAxisSelect'),
    yAxisSelect: document.getElementById('yAxisSelect'),
    aggregationSelect: document.getElementById('aggregationSelect'),
    sortOrderSelect: document.getElementById('sortOrderSelect'),
    topNSelect: document.getElementById('topNSelect'),
    chartNoticeBanner: document.getElementById('chartNoticeBanner'),
    chartNoticeText: document.getElementById('chartNoticeText'),
    renderedChartTitle: document.getElementById('renderedChartTitle'),
    renderedChartBadge: document.getElementById('renderedChartBadge'),
    mainChartCanvas: document.getElementById('mainChartCanvas'),

    // Insights
    insightsGrid: document.getElementById('insightsGrid'),

    // Numeric Stats Table
    numericStatsBody: document.getElementById('numericStatsBody'),

    // Data Table Explorer
    tableSearchInput: document.getElementById('tableSearchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    rowsPerPageSelect: document.getElementById('rowsPerPageSelect'),
    previewTableHead: document.getElementById('previewTableHead'),
    previewTableBody: document.getElementById('previewTableBody'),
    paginationInfo: document.getElementById('paginationInfo'),
    pageNumberBadge: document.getElementById('pageNumberBadge'),
    prevPageBtn: document.getElementById('prevPageBtn'),
    nextPageBtn: document.getElementById('nextPageBtn')
  };

  // ==========================================================================
  // Initialization
  // ==========================================================================
  function init() {
    setupEventListeners();
  }

  // ==========================================================================
  // Event Listeners
  // ==========================================================================
  function setupEventListeners() {
    // Mobile Sidebar Toggles
    if (elements.sidebarOpenBtn) {
      elements.sidebarOpenBtn.addEventListener('click', () => {
        elements.sidebar.classList.add('mobile-open');
      });
    }
    if (elements.sidebarCloseBtn) {
      elements.sidebarCloseBtn.addEventListener('click', () => {
        elements.sidebar.classList.remove('mobile-open');
      });
    }

    // Smooth navigation scrolling & active states
    elements.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        elements.navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        const targetId = link.getAttribute('data-section');
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
          if (elements.sidebar.classList.contains('mobile-open')) {
            elements.sidebar.classList.remove('mobile-open');
          }
        }
      });
    });

    // File Drag and Drop
    const dropZone = elements.dropZone;
    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('dragover');
      });
    });
    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
      });
    });

    dropZone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFileSelection(files[0]);
      }
    });

    // File Input Change
    elements.csvFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileSelection(e.target.files[0]);
      }
    });

    // Load Sample Dataset Buttons
    if (elements.loadSampleBtn) {
      elements.loadSampleBtn.addEventListener('click', () => {
        const key = elements.sampleDatasetSelect.value;
        loadSampleData(key);
      });
    }
    if (elements.topLoadSampleBtn) {
      elements.topLoadSampleBtn.addEventListener('click', () => {
        loadSampleData('sales');
      });
    }
    if (elements.heroSampleBtn) {
      elements.heroSampleBtn.addEventListener('click', () => {
        loadSampleData('sales');
      });
    }

    // Reset Data
    if (elements.resetDataBtn) {
      elements.resetDataBtn.addEventListener('click', resetApplicationState);
    }

    // Chart Studio Controls
    const chartControlInputs = [
      elements.chartTypeSelect,
      elements.xAxisSelect,
      elements.yAxisSelect,
      elements.aggregationSelect,
      elements.sortOrderSelect,
      elements.topNSelect
    ];

    chartControlInputs.forEach(input => {
      if (input) {
        input.addEventListener('change', () => {
          updateChartControlsState();
          renderChart();
        });
      }
    });

    // Chart Image Export
    if (elements.exportChartBtn) {
      elements.exportChartBtn.addEventListener('click', exportChartImage);
    }
    if (elements.downloadChartBtn) {
      elements.downloadChartBtn.addEventListener('click', exportChartImage);
    }

    // Table Search & Pagination
    if (elements.tableSearchInput) {
      elements.tableSearchInput.addEventListener('input', (e) => {
        state.table.searchTerm = e.target.value.trim().toLowerCase();
        state.table.currentPage = 1;
        if (elements.clearSearchBtn) {
          elements.clearSearchBtn.style.display = state.table.searchTerm ? 'block' : 'none';
        }
        applyTableFiltersAndRender();
      });
    }

    if (elements.clearSearchBtn) {
      elements.clearSearchBtn.addEventListener('click', () => {
        elements.tableSearchInput.value = '';
        state.table.searchTerm = '';
        elements.clearSearchBtn.style.display = 'none';
        state.table.currentPage = 1;
        applyTableFiltersAndRender();
      });
    }

    if (elements.rowsPerPageSelect) {
      elements.rowsPerPageSelect.addEventListener('change', (e) => {
        state.table.pageSize = parseInt(e.target.value, 10);
        state.table.currentPage = 1;
        applyTableFiltersAndRender();
      });
    }

    if (elements.prevPageBtn) {
      elements.prevPageBtn.addEventListener('click', () => {
        if (state.table.currentPage > 1) {
          state.table.currentPage--;
          renderTableRows();
        }
      });
    }

    if (elements.nextPageBtn) {
      elements.nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(state.table.filteredRows.length / state.table.pageSize);
        if (state.table.currentPage < totalPages) {
          state.table.currentPage++;
          renderTableRows();
        }
      });
    }
  }

  // ==========================================================================
  // File Handling & Parsing
  // ==========================================================================
  function handleFileSelection(file) {
    if (!file) return;

    // Validate file extension
    const extension = file.name.split('.').pop().toLowerCase();
    if (extension !== 'csv' && file.type !== 'text/csv' && file.type !== 'application/vnd.ms-excel') {
      showAlert(
        `Invalid file format: "${file.name}". Please upload a valid CSV (.csv) file.`,
        'danger'
      );
      return;
    }

    // Validate file size (alert if > 25MB)
    if (file.size > 25 * 1024 * 1024) {
      showAlert(
        `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). For browser stability, keep files under 25 MB.`,
        'warning'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const csvText = e.target.result;
      parseAndLoadDataset(csvText, file.name, file.size);
    };
    reader.onerror = function () {
      showAlert('Error reading file from disk. Please try again.', 'danger');
    };
    reader.readAsText(file);
  }

  function loadSampleData(sampleKey) {
    const sample = SAMPLE_DATASETS[sampleKey];
    if (!sample) {
      showAlert('Selected sample dataset not found.', 'danger');
      return;
    }
    const byteSize = new Blob([sample.data]).size;
    parseAndLoadDataset(sample.data, sample.fileName, byteSize);
    showAlert(`Loaded sample dataset: "${sample.fileName}" successfully!`, 'success', 4000);
  }

  function parseAndLoadDataset(csvText, fileName, fileSize) {
    if (!csvText || !csvText.trim()) {
      showAlert('Uploaded file is completely empty. Please select a CSV with data rows.', 'danger');
      return;
    }

    // Use PapaParse with robust configurations
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false, // We do custom type inference for resilience against currency/commas
      transformHeader: function (header) {
        return header ? header.trim() : 'Unnamed_Col';
      },
      complete: function (results) {
        if (results.errors && results.errors.length > 0) {
          const criticalErrors = results.errors.filter(err => err.type !== 'FieldMismatch');
          if (criticalErrors.length > 0) {
            showAlert(`CSV Parse Warning: ${criticalErrors[0].message} (Row ${criticalErrors[0].row})`, 'warning');
          }
        }

        const dataRows = results.data;
        const fields = results.meta.fields || [];

        // Validate rows and columns
        if (!fields || fields.length === 0) {
          showAlert('No valid column headers found in CSV. Please verify header row.', 'danger');
          return;
        }

        if (!dataRows || dataRows.length === 0) {
          showAlert('CSV has headers but contains zero data rows.', 'danger');
          return;
        }

        // Store state
        state.rawCsvText = csvText;
        state.fileName = fileName;
        state.fileSize = fileSize;
        state.headers = fields;
        state.rows = dataRows;

        // Perform analysis pipeline
        analyzeColumnTypes();
        computeNumericStatistics();
        
        // Update UI
        updateFileMetaUI();
        renderKpiCards();
        populateChartSelectors();
        renderChart();
        generateDataInsights();
        renderNumericStatsTable();
        
        // Reset table state
        state.table.searchTerm = '';
        state.table.currentPage = 1;
        state.table.sortColumn = null;
        if (elements.tableSearchInput) elements.tableSearchInput.value = '';
        applyTableFiltersAndRender();

        // Reveal dashboard, hide hero
        elements.emptyStateHero.style.display = 'none';
        elements.dashboardContent.style.display = 'block';

        if (elements.exportChartBtn) elements.exportChartBtn.disabled = false;
      },
      error: function (err) {
        showAlert(`Failed to parse CSV: ${err.message}`, 'danger');
      }
    });
  }

  // ==========================================================================
  // Data Type Inference Engine
  // ==========================================================================
  function analyzeColumnTypes() {
    state.columnTypes = {};

    state.headers.forEach(header => {
      let numericCount = 0;
      let dateCount = 0;
      let totalNonEmpty = 0;

      for (let i = 0; i < state.rows.length; i++) {
        const rawVal = state.rows[i][header];
        if (rawVal === undefined || rawVal === null || String(rawVal).trim() === '') {
          continue;
        }

        totalNonEmpty++;
        const strVal = String(rawVal).trim();

        // Clean currency, percentages, commas: e.g. "$1,200.50" or "85%"
        const cleanedStr = strVal.replace(/^[$€£₹]/, '').replace(/%$/, '').replace(/,/g, '').trim();

        if (cleanedStr !== '' && !isNaN(Number(cleanedStr))) {
          numericCount++;
        } else if (!isNaN(Date.parse(strVal)) && strVal.length >= 8 && /\d/.test(strVal) && (strVal.includes('-') || strVal.includes('/'))) {
          dateCount++;
        }
      }

      if (totalNonEmpty === 0) {
        state.columnTypes[header] = 'categorical';
      } else if (numericCount / totalNonEmpty >= 0.75) {
        state.columnTypes[header] = 'numeric';
      } else if (dateCount / totalNonEmpty >= 0.75) {
        state.columnTypes[header] = 'date';
      } else {
        state.columnTypes[header] = 'categorical';
      }
    });
  }

  // Helper to parse clean number from cell
  function parseCleanNumber(val) {
    if (val === undefined || val === null) return NaN;
    const str = String(val).trim().replace(/^[$€£₹]/, '').replace(/%$/, '').replace(/,/g, '').trim();
    if (str === '') return NaN;
    return Number(str);
  }

  // ==========================================================================
  // Statistics Engine
  // ==========================================================================
  function computeNumericStatistics() {
    state.numericStats = {};

    state.headers.forEach(header => {
      if (state.columnTypes[header] !== 'numeric') return;

      const numbers = [];
      let nullCount = 0;

      state.rows.forEach(row => {
        const num = parseCleanNumber(row[header]);
        if (!isNaN(num)) {
          numbers.push(num);
        } else {
          nullCount++;
        }
      });

      if (numbers.length === 0) return;

      // Sort numbers for median calculation
      numbers.sort((a, b) => a - b);

      const count = numbers.length;
      const sum = numbers.reduce((acc, curr) => acc + curr, 0);
      const mean = sum / count;
      const min = numbers[0];
      const max = numbers[count - 1];
      const range = max - min;

      // Median
      const mid = Math.floor(count / 2);
      const median = count % 2 !== 0 ? numbers[mid] : (numbers[mid - 1] + numbers[mid]) / 2;

      // Standard Deviation
      let varianceSum = 0;
      for (let i = 0; i < count; i++) {
        varianceSum += Math.pow(numbers[i] - mean, 2);
      }
      const stdDev = count > 1 ? Math.sqrt(varianceSum / (count - 1)) : 0;

      state.numericStats[header] = {
        count,
        sum,
        mean,
        median,
        min,
        max,
        range,
        stdDev,
        nulls: nullCount
      };
    });
  }

  // ==========================================================================
  // UI Meta & KPI Rendering
  // ==========================================================================
  function updateFileMetaUI() {
    elements.activeFileMeta.style.display = 'block';
    elements.activeFileName.textContent = state.fileName;
    elements.activeFileSize.textContent = formatBytes(state.fileSize);

    // Status pill
    elements.datasetStatusPill.innerHTML = `
      <span class="status-dot dot-active"></span>
      <span id="statusText">Active: ${escapeHTML(state.fileName)}</span>
    `;

    if (elements.overviewFileTag) {
      elements.overviewFileTag.textContent = `${state.fileName} (${formatBytes(state.fileSize)})`;
    }
  }

  function renderKpiCards() {
    const totalRows = state.rows.length;
    const totalCols = state.headers.length;

    let numericColCount = 0;
    let categoryColCount = 0;
    Object.values(state.columnTypes).forEach(type => {
      if (type === 'numeric') numericColCount++;
      else categoryColCount++;
    });

    // Count missing cells across all rows
    let missingCells = 0;
    state.rows.forEach(row => {
      state.headers.forEach(h => {
        const val = row[h];
        if (val === undefined || val === null || String(val).trim() === '') {
          missingCells++;
        }
      });
    });

    const totalCells = totalRows * totalCols;
    const completenessRate = totalCells > 0 ? (((totalCells - missingCells) / totalCells) * 100).toFixed(1) : 100;

    elements.kpiRows.textContent = totalRows.toLocaleString();
    elements.kpiCols.textContent = totalCols.toLocaleString();
    elements.kpiNumericCols.textContent = numericColCount.toLocaleString();
    elements.kpiCategoryCols.textContent = categoryColCount.toLocaleString();
    elements.kpiMissingCells.textContent = missingCells.toLocaleString();
    elements.kpiCompleteness.textContent = `${completenessRate}% data completeness`;
  }

  // ==========================================================================
  // Chart Studio Controls & Population
  // ==========================================================================
  function populateChartSelectors() {
    const xSelect = elements.xAxisSelect;
    const ySelect = elements.yAxisSelect;

    xSelect.innerHTML = '';
    ySelect.innerHTML = '';

    const numericHeaders = state.headers.filter(h => state.columnTypes[h] === 'numeric');
    const categoricalHeaders = state.headers.filter(h => state.columnTypes[h] !== 'numeric');

    // Populate X-Axis (Categories first, then numeric)
    const sortedXHeaders = [...categoricalHeaders, ...numericHeaders];
    sortedXHeaders.forEach(header => {
      const opt = document.createElement('option');
      opt.value = header;
      const typeLabel = state.columnTypes[header] === 'numeric' ? '#' : (state.columnTypes[header] === 'date' ? '📅' : 'Aa');
      opt.textContent = `${header} (${typeLabel})`;
      xSelect.appendChild(opt);
    });

    // Populate Y-Axis (Numeric columns first, or frequency)
    numericHeaders.forEach(header => {
      const opt = document.createElement('option');
      opt.value = header;
      opt.textContent = `${header} (# Numeric)`;
      ySelect.appendChild(opt);
    });

    // Also allow row count / frequency option
    const countOption = document.createElement('option');
    countOption.value = '__ROW_COUNT__';
    countOption.textContent = 'Frequency / Record Count';
    ySelect.appendChild(countOption);

    // Pick smart defaults
    if (categoricalHeaders.length > 0) {
      xSelect.value = categoricalHeaders[0];
    } else if (state.headers.length > 0) {
      xSelect.value = state.headers[0];
    }

    if (numericHeaders.length > 0) {
      ySelect.value = numericHeaders[0];
    } else {
      ySelect.value = '__ROW_COUNT__';
    }

    updateChartControlsState();
  }

  function updateChartControlsState() {
    state.chartConfig.type = elements.chartTypeSelect.value;
    state.chartConfig.xAxis = elements.xAxisSelect.value;
    state.chartConfig.yAxis = elements.yAxisSelect.value;
    state.chartConfig.aggregation = elements.aggregationSelect.value;
    state.chartConfig.sortOrder = elements.sortOrderSelect.value;
    state.chartConfig.topN = elements.topNSelect.value;

    // Notice banner validation
    validateChartSelection();
  }

  function validateChartSelection() {
    const { type, xAxis, yAxis, aggregation } = state.chartConfig;
    const banner = elements.chartNoticeBanner;
    const bannerText = elements.chartNoticeText;

    let notice = '';

    if (type === 'pie' || type === 'doughnut') {
      // Check if categories might be too many
      const uniqueXValues = new Set(state.rows.map(r => String(r[xAxis] || '').trim())).size;
      if (uniqueXValues > 15 && state.chartConfig.topN === 'all') {
        notice = `Notice: "${xAxis}" has ${uniqueXValues} distinct categories. Pie charts become crowded with >10 slices. We recommend selecting "Top 5" or "Top 10" above.`;
      }
    }

    if (yAxis === '__ROW_COUNT__' && aggregation !== 'count') {
      notice = 'Tip: When using "Frequency / Record Count", the aggregation is automatically treated as Count.';
    }

    if (notice) {
      bannerText.textContent = notice;
      banner.style.display = 'flex';
    } else {
      banner.style.display = 'none';
    }
  }

  // ==========================================================================
  // Chart Rendering Engine (Chart.js)
  // ==========================================================================
  function renderChart() {
    if (!state.rows || state.rows.length === 0) return;

    const { type, xAxis, yAxis, aggregation, sortOrder, topN } = state.chartConfig;

    if (!xAxis) {
      showAlert('Please select an X-Axis column for the chart.', 'warning');
      return;
    }

    // Aggregate Data
    const groupMap = new Map(); // key -> Array of numbers

    state.rows.forEach(row => {
      const rawX = row[xAxis];
      const xKey = (rawX === undefined || rawX === null || String(rawX).trim() === '') ? '(Blank)' : String(rawX).trim();

      let val = 1;
      if (yAxis !== '__ROW_COUNT__') {
        const num = parseCleanNumber(row[yAxis]);
        val = isNaN(num) ? 0 : num;
      }

      if (!groupMap.has(xKey)) {
        groupMap.set(xKey, []);
      }
      groupMap.get(xKey).push(val);
    });

    // Compute aggregated values
    let chartEntries = [];
    groupMap.forEach((values, key) => {
      let aggregatedValue = 0;

      if (yAxis === '__ROW_COUNT__' || aggregation === 'count') {
        aggregatedValue = values.length;
      } else if (aggregation === 'sum') {
        aggregatedValue = values.reduce((a, b) => a + b, 0);
      } else if (aggregation === 'mean') {
        aggregatedValue = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      } else if (aggregation === 'max') {
        aggregatedValue = Math.max(...values);
      } else if (aggregation === 'min') {
        aggregatedValue = Math.min(...values);
      }

      chartEntries.push({ label: key, value: aggregatedValue });
    });

    // Sort entries
    if (sortOrder === 'desc') {
      chartEntries.sort((a, b) => b.value - a.value);
    } else if (sortOrder === 'asc') {
      chartEntries.sort((a, b) => a.value - b.value);
    } else if (sortOrder === 'alpha') {
      chartEntries.sort((a, b) => a.label.localeCompare(b.label));
    }
    // 'none' preserves group insertion order

    // Apply Top N limit
    const totalUniqueCount = chartEntries.length;
    if (topN !== 'all') {
      const limit = parseInt(topN, 10);
      if (!isNaN(limit) && limit < chartEntries.length) {
        const topSlice = chartEntries.slice(0, limit);
        const remaining = chartEntries.slice(limit);
        const otherSum = remaining.reduce((acc, curr) => acc + curr.value, 0);

        if (type === 'pie' || type === 'doughnut') {
          // For pie charts, group remainder into "Others"
          if (otherSum > 0) {
            topSlice.push({ label: `Other (${remaining.length} categories)`, value: otherSum });
          }
        }
        chartEntries = topSlice;
      }
    }

    const labels = chartEntries.map(e => e.label);
    const dataValues = chartEntries.map(e => e.value);

    // Chart metadata labels
    const metricName = yAxis === '__ROW_COUNT__' ? 'Frequency (Count)' : `${yAxis} (${capitalize(aggregation)})`;
    elements.renderedChartTitle.textContent = `${metricName} by ${xAxis}`;
    elements.renderedChartBadge.textContent = `${chartEntries.length} items shown of ${totalUniqueCount}`;

    // Destroy existing chart to prevent canvas reuse bugs
    if (state.chartInstance) {
      state.chartInstance.destroy();
      state.chartInstance = null;
    }

    const ctx = elements.mainChartCanvas.getContext('2d');

    // Chart.js type mapping
    let chartJsType = type;
    let isHorizontal = false;
    if (type === 'horizontalBar') {
      chartJsType = 'bar';
      isHorizontal = true;
    }

    // Determine colors
    const isMultiColor = (type === 'pie' || type === 'doughnut');
    let backgroundColors;
    let borderColors;

    if (isMultiColor) {
      backgroundColors = labels.map((_, i) => CHART_PALETTE[i % CHART_PALETTE.length] + 'cc');
      borderColors = labels.map((_, i) => CHART_PALETTE[i % CHART_PALETTE.length]);
    } else if (type === 'line') {
      backgroundColors = 'rgba(79, 70, 229, 0.15)';
      borderColors = '#4f46e5';
    } else {
      backgroundColors = 'rgba(79, 70, 229, 0.85)';
      borderColors = '#4338ca';
    }

    const config = {
      type: chartJsType,
      data: {
        labels: labels,
        datasets: [{
          label: metricName,
          data: dataValues,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: type === 'line' ? 2.5 : 1,
          fill: type === 'line',
          tension: 0.3,
          pointRadius: type === 'line' ? 4 : 0,
          pointHoverRadius: 6,
          borderRadius: (chartJsType === 'bar') ? 4 : 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: isHorizontal ? 'y' : 'x',
        plugins: {
          legend: {
            display: isMultiColor,
            position: 'right',
            labels: {
              boxWidth: 14,
              font: { family: 'Inter', size: 12 }
            }
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleFont: { family: 'Inter', size: 13, weight: 'bold' },
            bodyFont: { family: 'Inter', size: 12 },
            padding: 10,
            cornerRadius: 6,
            callbacks: {
              label: function (context) {
                const val = context.raw;
                const formatted = typeof val === 'number' ? (val % 1 !== 0 ? val.toFixed(2) : val.toLocaleString()) : val;
                return ` ${metricName}: ${formatted}`;
              }
            }
          }
        },
        scales: (type === 'pie' || type === 'doughnut') ? {} : {
          x: {
            grid: { color: 'rgba(226, 232, 240, 0.7)' },
            ticks: {
              font: { family: 'Inter', size: 11 },
              maxRotation: 45,
              minRotation: 0,
              callback: function (val, index) {
                const label = this.getLabelForValue(val);
                return (label && label.length > 18) ? label.substr(0, 16) + '...' : label;
              }
            }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(226, 232, 240, 0.7)' },
            ticks: {
              font: { family: 'JetBrains Mono', size: 11 },
              callback: function (value) {
                if (Math.abs(value) >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                if (Math.abs(value) >= 1000) return (value / 1000).toFixed(1) + 'k';
                return value;
              }
            }
          }
        }
      }
    };

    state.chartInstance = new Chart(ctx, config);
  }

  function exportChartImage() {
    if (!state.chartInstance) {
      showAlert('No active chart available to export.', 'warning');
      return;
    }

    try {
      const imageUri = state.chartInstance.toBase64Image('image/png', 1.0);
      const downloadLink = document.createElement('a');
      downloadLink.download = `${(state.fileName || 'chart').replace(/\.csv$/i, '')}_visualization.png`;
      downloadLink.href = imageUri;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      showAlert('Chart successfully exported as high-resolution PNG image!', 'success', 3000);
    } catch (err) {
      showAlert('Failed to export chart image: ' + err.message, 'danger');
    }
  }

  // ==========================================================================
  // Automated Data Insights Engine (Rule-based & Plain English)
  // ==========================================================================
  function generateDataInsights() {
    const grid = elements.insightsGrid;
    grid.innerHTML = '';

    const insights = [];
    const numericCols = Object.keys(state.numericStats);
    const catCols = state.headers.filter(h => state.columnTypes[h] === 'categorical');

    // 1. Data Health & Completeness Insight
    let totalCells = state.rows.length * state.headers.length;
    let missingCells = 0;
    state.rows.forEach(r => {
      state.headers.forEach(h => {
        if (r[h] === undefined || r[h] === null || String(r[h]).trim() === '') missingCells++;
      });
    });

    if (missingCells === 0) {
      insights.push({
        type: 'quality',
        badge: 'Data Integrity',
        badgeClass: 'badge-quality',
        cardClass: 'insight-quality',
        icon: 'fa-solid fa-shield-halved',
        title: 'Perfect Data Completeness',
        body: `The dataset contains <strong>${state.rows.length} rows</strong> across <strong>${state.headers.length} attributes</strong> with zero missing cells. All records are 100% complete and ready for exploratory analysis without imputation.`,
        metricLabel: 'Completeness Score',
        metricValue: '100%'
      });
    } else {
      const missingPct = ((missingCells / totalCells) * 100).toFixed(1);
      insights.push({
        type: 'variance',
        badge: 'Data Hygiene',
        badgeClass: 'badge-variance',
        cardClass: 'insight-variance',
        icon: 'fa-solid fa-triangle-exclamation',
        title: 'Missing Values Detected',
        body: `Found <strong>${missingCells.toLocaleString()} empty cells</strong> representing approximately <strong>${missingPct}%</strong> of all tabular data points. Numerical summaries exclude empty cells automatically to ensure computational accuracy.`,
        metricLabel: 'Missing Rate',
        metricValue: `${missingPct}%`
      });
    }

    // 2. Leader & Extremes Insight (Highest & Lowest for Primary Metric)
    if (numericCols.length > 0 && catCols.length > 0) {
      const catCol = catCols[0];
      const numCol = numericCols[numericCols.length - 1]; // Often total revenue/profit/salary

      const aggregateMap = {};
      state.rows.forEach(r => {
        const cat = String(r[catCol] || '(Blank)').trim();
        const num = parseCleanNumber(r[numCol]) || 0;
        aggregateMap[cat] = (aggregateMap[cat] || 0) + num;
      });

      const sortedEntries = Object.entries(aggregateMap).sort((a, b) => b[1] - a[1]);
      if (sortedEntries.length >= 2) {
        const top = sortedEntries[0];
        const bottom = sortedEntries[sortedEntries.length - 1];
        const ratio = bottom[1] > 0 ? (top[1] / bottom[1]).toFixed(1) : 'N/A';

        insights.push({
          type: 'leader',
          badge: 'Top Performer',
          badgeClass: 'badge-leader',
          cardClass: 'insight-leader',
          icon: 'fa-solid fa-trophy',
          title: `Dominant Category in ${escapeHTML(numCol)}`,
          body: `<strong>"${escapeHTML(top[0])}"</strong> leads all categories in <strong>${escapeHTML(numCol)}</strong> with an aggregate total of <strong>${formatNumberShort(top[1])}</strong>.${ratio !== 'N/A' ? ` This outperforms the lowest tier (<strong>"${escapeHTML(bottom[0])}"</strong> at ${formatNumberShort(bottom[1])}) by a factor of <strong>${ratio}x</strong>.` : ''}`,
          metricLabel: 'Top Share Leader',
          metricValue: `${escapeHTML(top[0])} (${formatNumberShort(top[1])})`
        });
      }
    }

    // 3. Distribution & Variance / Outliers
    if (numericCols.length > 0) {
      // Find numeric column with highest variation (stdDev / mean)
      let highestCvCol = null;
      let highestCv = -1;

      numericCols.forEach(col => {
        const stats = state.numericStats[col];
        if (stats && stats.mean > 0) {
          const cv = stats.stdDev / stats.mean;
          if (cv > highestCv) {
            highestCv = cv;
            highestCvCol = col;
          }
        }
      });

      if (highestCvCol) {
        const st = state.numericStats[highestCvCol];
        const cvPercent = (highestCv * 100).toFixed(0);

        // Check for statistical outliers (points beyond 2.0 standard deviations)
        let outlierCount = 0;
        state.rows.forEach(r => {
          const v = parseCleanNumber(r[highestCvCol]);
          if (!isNaN(v) && st.stdDev > 0) {
            if (Math.abs(v - st.mean) > 2.0 * st.stdDev) {
              outlierCount++;
            }
          }
        });

        insights.push({
          type: 'variance',
          badge: 'Variance & Spread',
          badgeClass: 'badge-variance',
          cardClass: 'insight-variance',
          icon: 'fa-solid fa-chart-line-up',
          title: `High Variability in "${escapeHTML(highestCvCol)}"`,
          body: `Values in <strong>${escapeHTML(highestCvCol)}</strong> exhibit notable dispersion with a standard deviation of <strong>${formatNumberShort(st.stdDev)}</strong> (Mean: ${formatNumberShort(st.mean)}). ${outlierCount > 0 ? `Detected <strong>${outlierCount} record(s)</strong> that deviate beyond 2 standard deviations.` : 'Values span from ' + formatNumberShort(st.min) + ' to ' + formatNumberShort(st.max) + '.'}`,
          metricLabel: 'Coefficient of Variation',
          metricValue: `${cvPercent}%`
        });
      }
    }

    // 4. Pareto / Concentration Analysis
    if (catCols.length > 0 && numericCols.length > 0) {
      const catCol = catCols[0];
      const numCol = numericCols[0];
      const agg = {};
      let totalSum = 0;

      state.rows.forEach(r => {
        const c = String(r[catCol] || '(Blank)').trim();
        const n = parseCleanNumber(r[numCol]) || 0;
        agg[c] = (agg[c] || 0) + n;
        totalSum += n;
      });

      const sorted = Object.entries(agg).sort((a, b) => b[1] - a[1]);
      if (sorted.length >= 3 && totalSum > 0) {
        const topTwoSum = (sorted[0][1] + sorted[1][1]);
        const topTwoShare = ((topTwoSum / totalSum) * 100).toFixed(1);

        insights.push({
          type: 'concentration',
          badge: 'Pareto Share',
          badgeClass: 'badge-concentration',
          cardClass: 'insight-concentration',
          icon: 'fa-solid fa-pie-chart',
          title: `Volume Concentration in Top Segments`,
          body: `The top 2 categories (<strong>"${escapeHTML(sorted[0][0])}"</strong> and <strong>"${escapeHTML(sorted[1][0])}"</strong>) account for <strong>${topTwoShare}%</strong> of cumulative <strong>${escapeHTML(numCol)}</strong> across all ${sorted.length} unique segments.`,
          metricLabel: 'Top 2 Concentration',
          metricValue: `${topTwoShare}%`
        });
      }
    }

    // 5. Trend / Correlation Direction Check
    if (numericCols.length >= 2) {
      const colX = numericCols[0];
      const colY = numericCols[1];

      // Calculate Pearson correlation coefficient
      let r = calculatePearsonCorrelation(colX, colY);
      if (!isNaN(r)) {
        let correlationDescription = '';
        let badgeIcon = 'fa-solid fa-arrow-trend-up';

        if (r >= 0.6) {
          correlationDescription = `Strong positive correlation (r = ${r.toFixed(2)}) between <strong>${escapeHTML(colX)}</strong> and <strong>${escapeHTML(colY)}</strong>. As ${escapeHTML(colX)} grows, ${escapeHTML(colY)} tends to increase proportionately.`;
        } else if (r <= -0.6) {
          correlationDescription = `Negative inverse correlation (r = ${r.toFixed(2)}) between <strong>${escapeHTML(colX)}</strong> and <strong>${escapeHTML(colY)}</strong>. Increases in ${escapeHTML(colX)} correspond with downward shifts in ${escapeHTML(colY)}.`;
          badgeIcon = 'fa-solid fa-arrow-trend-down';
        } else if (Math.abs(r) >= 0.3) {
          correlationDescription = `Moderate correlation (r = ${r.toFixed(2)}) observed between <strong>${escapeHTML(colX)}</strong> and <strong>${escapeHTML(colY)}</strong>.`;
        } else {
          correlationDescription = `Near-zero linear correlation (r = ${r.toFixed(2)}) between <strong>${escapeHTML(colX)}</strong> and <strong>${escapeHTML(colY)}</strong>, indicating independent distribution behaviors.`;
        }

        insights.push({
          type: 'trend',
          badge: 'Correlation Signal',
          badgeClass: 'badge-trend',
          cardClass: 'insight-trend',
          icon: badgeIcon,
          title: `Relationship: ${escapeHTML(colX)} vs ${escapeHTML(colY)}`,
          body: correlationDescription,
          metricLabel: 'Pearson Coefficient (r)',
          metricValue: r.toFixed(2)
        });
      }
    }

    // Render cards into container
    insights.forEach(ins => {
      const card = document.createElement('div');
      card.className = `insight-card ${ins.cardClass}`;
      card.innerHTML = `
        <div class="insight-header">
          <span class="insight-badge ${ins.badgeClass}">
            <i class="${ins.icon}"></i> ${ins.badge}
          </span>
        </div>
        <h3 class="insight-title">${ins.title}</h3>
        <p class="insight-body">${ins.body}</p>
        <div class="insight-stat-highlight">
          <span>${ins.metricLabel}</span>
          <span class="highlight-val">${ins.metricValue}</span>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  function calculatePearsonCorrelation(colX, colY) {
    const xVals = [];
    const yVals = [];

    state.rows.forEach(r => {
      const x = parseCleanNumber(r[colX]);
      const y = parseCleanNumber(r[colY]);
      if (!isNaN(x) && !isNaN(y)) {
        xVals.push(x);
        yVals.push(y);
      }
    });

    const n = xVals.length;
    if (n < 3) return NaN;

    const meanX = xVals.reduce((a, b) => a + b, 0) / n;
    const meanY = yVals.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denomX = 0;
    let denomY = 0;

    for (let i = 0; i < n; i++) {
      const dx = xVals[i] - meanX;
      const dy = yVals[i] - meanY;
      numerator += dx * dy;
      denomX += dx * dx;
      denomY += dy * dy;
    }

    const denominator = Math.sqrt(denomX * denomY);
    if (denominator === 0) return 0;
    return numerator / denominator;
  }

  // ==========================================================================
  // Numeric Statistics Matrix Table
  // ==========================================================================
  function renderNumericStatsTable() {
    const tbody = elements.numericStatsBody;
    tbody.innerHTML = '';

    const cols = Object.keys(state.numericStats);

    if (cols.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="10" style="text-align: center; color: var(--text-muted); padding: 2rem;">No numeric columns detected in current dataset.</td>`;
      tbody.appendChild(tr);
      return;
    }

    cols.forEach(col => {
      const s = state.numericStats[col];
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${escapeHTML(col)}</strong></td>
        <td class="numeric-cell">${s.count.toLocaleString()}</td>
        <td class="numeric-cell">${formatNumberDisplay(s.sum)}</td>
        <td class="numeric-cell">${formatNumberDisplay(s.mean)}</td>
        <td class="numeric-cell">${formatNumberDisplay(s.median)}</td>
        <td class="numeric-cell">${formatNumberDisplay(s.min)}</td>
        <td class="numeric-cell">${formatNumberDisplay(s.max)}</td>
        <td class="numeric-cell">${formatNumberDisplay(s.range)}</td>
        <td class="numeric-cell">${formatNumberDisplay(s.stdDev)}</td>
        <td class="numeric-cell" style="color: ${s.nulls > 0 ? 'var(--accent-rose)' : 'var(--text-muted)'}">${s.nulls}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // ==========================================================================
  // Interactive Data Table Explorer
  // ==========================================================================
  function applyTableFiltersAndRender() {
    const term = state.table.searchTerm;

    if (!term) {
      state.table.filteredRows = [...state.rows];
    } else {
      state.table.filteredRows = state.rows.filter(row => {
        return state.headers.some(header => {
          const val = row[header];
          return val !== undefined && val !== null && String(val).toLowerCase().includes(term);
        });
      });
    }

    // Apply sorting if active
    if (state.table.sortColumn) {
      const col = state.table.sortColumn;
      const dir = state.table.sortDirection === 'asc' ? 1 : -1;
      const isNum = state.columnTypes[col] === 'numeric';

      state.table.filteredRows.sort((a, b) => {
        const valA = a[col];
        const valB = b[col];

        if (valA === valB) return 0;
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        if (isNum) {
          const numA = parseCleanNumber(valA);
          const numB = parseCleanNumber(valB);
          if (isNaN(numA)) return 1;
          if (isNaN(numB)) return -1;
          return (numA - numB) * dir;
        }

        return String(valA).localeCompare(String(valB)) * dir;
      });
    }

    renderTableHeader();
    renderTableRows();
  }

  function renderTableHeader() {
    const thead = elements.previewTableHead;
    thead.innerHTML = '';

    const tr = document.createElement('tr');

    // Index column #
    const thIdx = document.createElement('th');
    thIdx.style.width = '50px';
    thIdx.textContent = '#';
    tr.appendChild(thIdx);

    state.headers.forEach(header => {
      const th = document.createElement('th');
      th.className = 'sortable-th';

      const type = state.columnTypes[header];
      const typeBadge = type === 'numeric' ? '#' : (type === 'date' ? '📅' : 'Aa');

      let sortIndicator = '<i class="fa-solid fa-sort sort-icon"></i>';
      if (state.table.sortColumn === header) {
        th.classList.add(state.table.sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
        sortIndicator = state.table.sortDirection === 'asc'
          ? '<i class="fa-solid fa-sort-up sort-icon"></i>'
          : '<i class="fa-solid fa-sort-down sort-icon"></i>';
      }

      th.innerHTML = `
        <span>${escapeHTML(header)}</span>
        <span class="th-type-pill">${typeBadge}</span>
        ${sortIndicator}
      `;

      th.addEventListener('click', () => {
        if (state.table.sortColumn === header) {
          state.table.sortDirection = state.table.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          state.table.sortColumn = header;
          state.table.sortDirection = 'asc';
        }
        applyTableFiltersAndRender();
      });

      tr.appendChild(th);
    });

    thead.appendChild(tr);
  }

  function renderTableRows() {
    const tbody = elements.previewTableBody;
    tbody.innerHTML = '';

    const totalFiltered = state.table.filteredRows.length;
    const { currentPage, pageSize } = state.table;
    const totalPages = Math.ceil(totalFiltered / pageSize) || 1;

    // Constrain page
    if (state.table.currentPage > totalPages) {
      state.table.currentPage = totalPages;
    }

    const startIndex = (state.table.currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalFiltered);
    const pageRows = state.table.filteredRows.slice(startIndex, endIndex);

    if (pageRows.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="${state.headers.length + 1}" style="text-align: center; color: var(--text-muted); padding: 2rem;">No matching rows found for query.</td>`;
      tbody.appendChild(tr);
    } else {
      pageRows.forEach((row, i) => {
        const tr = document.createElement('tr');
        
        // Row index
        const tdIdx = document.createElement('td');
        tdIdx.style.color = 'var(--text-subtle)';
        tdIdx.style.fontFamily = 'var(--font-mono)';
        tdIdx.textContent = (startIndex + i + 1).toString();
        tr.appendChild(tdIdx);

        state.headers.forEach(h => {
          const td = document.createElement('td');
          const val = row[h];
          const isNumeric = state.columnTypes[h] === 'numeric';

          if (isNumeric) {
            td.className = 'numeric-cell';
          }

          if (val === undefined || val === null || String(val).trim() === '') {
            td.innerHTML = '<span style="color: var(--text-subtle); font-style: italic;">null</span>';
          } else {
            td.textContent = String(val);
          }
          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });
    }

    // Pagination Info & Buttons
    elements.paginationInfo.textContent = totalFiltered > 0
      ? `Showing ${startIndex + 1} to ${endIndex} of ${totalFiltered.toLocaleString()} entries`
      : '0 entries to display';

    elements.pageNumberBadge.textContent = `Page ${state.table.currentPage} of ${totalPages}`;
    elements.prevPageBtn.disabled = state.table.currentPage <= 1;
    elements.nextPageBtn.disabled = state.table.currentPage >= totalPages;
  }

  // ==========================================================================
  // Reset Application State
  // ==========================================================================
  function resetApplicationState() {
    state.rawCsvText = '';
    state.fileName = '';
    state.fileSize = 0;
    state.headers = [];
    state.rows = [];
    state.columnTypes = {};
    state.numericStats = {};

    if (state.chartInstance) {
      state.chartInstance.destroy();
      state.chartInstance = null;
    }

    // Reset controls
    elements.csvFileInput.value = '';
    elements.activeFileMeta.style.display = 'none';
    elements.datasetStatusPill.innerHTML = `
      <span class="status-dot dot-idle"></span>
      <span id="statusText">No dataset loaded</span>
    `;

    elements.dashboardContent.style.display = 'none';
    elements.emptyStateHero.style.display = 'flex';
    if (elements.exportChartBtn) elements.exportChartBtn.disabled = true;

    showAlert('Dataset cleared. You can upload a new CSV file anytime.', 'info', 3000);
  }

  // ==========================================================================
  // Alert Notifications
  // ==========================================================================
  function showAlert(message, type = 'info', duration = 6000) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;

    let iconClass = 'fa-solid fa-circle-info';
    if (type === 'danger') iconClass = 'fa-solid fa-triangle-exclamation';
    if (type === 'warning') iconClass = 'fa-solid fa-circle-exclamation';
    if (type === 'success') iconClass = 'fa-solid fa-circle-check';

    alertDiv.innerHTML = `
      <i class="${iconClass} alert-icon"></i>
      <div class="alert-message">${escapeHTML(message)}</div>
      <button type="button" class="alert-close" aria-label="Dismiss alert">&times;</button>
    `;

    const closeBtn = alertDiv.querySelector('.alert-close');
    closeBtn.addEventListener('click', () => {
      alertDiv.remove();
    });

    elements.alertContainer.appendChild(alertDiv);

    if (duration > 0) {
      setTimeout(() => {
        if (alertDiv.parentNode) {
          alertDiv.style.opacity = '0';
          alertDiv.style.transition = 'opacity 0.3s ease';
          setTimeout(() => alertDiv.remove(), 300);
        }
      }, duration);
    }
  }

  // ==========================================================================
  // Utility Functions
  // ==========================================================================
  function escapeHTML(str) {
    if (str === undefined || str === null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function formatNumberDisplay(num) {
    if (num === undefined || num === null || isNaN(num)) return '-';
    if (num % 1 === 0) return num.toLocaleString();
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatNumberShort(num) {
    if (num === undefined || num === null || isNaN(num)) return '0';
    if (Math.abs(num) >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (Math.abs(num) >= 1000) return (num / 1000).toFixed(1) + 'k';
    if (num % 1 !== 0) return num.toFixed(2);
    return num.toLocaleString();
  }

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Initialize on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', init);

})();
