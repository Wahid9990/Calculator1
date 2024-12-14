document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#editableTable tbody");
  const totalPiecesCells = document.querySelectorAll(".totalPieces");
  const totalPriceCells = document.querySelectorAll(".totalPrice");
  const overallTotalCell = document.querySelector("#overallTotalPrice");

  // Function to generate table rows
  function generateTable() {
    for (let row = 1; row <= 16; row++) {
      const tableRow = document.createElement("tr");

      // Date column
      const dateCell = document.createElement("td");
      const dateInput = document.createElement("input");
      dateInput.type = "text";
      dateInput.value = `Row ${row}`;
      dateInput.dataset.row = row;
      dateInput.classList.add("dateInput");
      dateInput.addEventListener("input", saveTableData);
      dateCell.appendChild(dateInput);
      tableRow.appendChild(dateCell);

      // Editable cells
      for (let col = 0; col < 14; col++) {
        const cell = document.createElement("td");
        const input = document.createElement("input");
        input.type = "text";
        input.value = "0";
        input.dataset.row = row;
        input.dataset.col = col;

        // Update totals on input
        input.addEventListener("input", () => {
          updateRowTotals();
          updateTotalPieces();
          updateTotalPrice();
          updateOverallTotalPrice();
          saveTableData();
          updateCellColor(input); // Update cell color
        });

        cell.appendChild(input);
        tableRow.appendChild(cell);
      }

      // Row Total column
      const totalCell = document.createElement("td");
      totalCell.textContent = "0.00";
      totalCell.className = "rowTotal";
      tableRow.appendChild(totalCell);

      tableBody.appendChild(tableRow);
    }
  }

  // Update cell color based on value
  function updateCellColor(input) {
    const cellValue = parseFloat(input.value) || 0;
    if (cellValue > 0) {
      input.style.backgroundColor = "green";
      input.style.color = "white";
    } else {
      input.style.backgroundColor = "white";
      input.style.color = "black";
    }
  }

  // Update row totals
  function updateRowTotals() {
    tableBody.querySelectorAll("tr").forEach((row) => {
      let rowTotal = 0;

      row.querySelectorAll("input:not(.dateInput)").forEach((input) => {
        const colIndex = input.dataset.col;
        const headerValue = parseFloat(document.querySelector(`.headerInput[data-index='${colIndex}']`).value) || 0;
        const cellValue = parseFloat(input.value) || 0;

        rowTotal += headerValue * cellValue;
      });

      const rowTotalCell = row.querySelector(".rowTotal");
      if (rowTotalCell) {
        rowTotalCell.textContent = rowTotal.toFixed(2);
      }
    });
  }

  // Update total pieces
  function updateTotalPieces() {
    totalPiecesCells.forEach((cell, colIndex) => {
      let colTotal = 0;
      document.querySelectorAll(`input[data-col='${colIndex}']`).forEach((input) => {
        colTotal += parseFloat(input.value) || 0;
      });
      cell.textContent = colTotal;
    });
  }

  // Update total price
  function updateTotalPrice() {
    totalPriceCells.forEach((cell, colIndex) => {
      const headerValue = parseFloat(document.querySelector(`.headerInput[data-index='${colIndex}']`).value) || 0;
      const totalPieces = parseFloat(document.querySelector(`.totalPieces[data-col='${colIndex}']`).textContent) || 0;
      const columnTotal = headerValue * totalPieces;

      cell.textContent = columnTotal.toFixed(2);
    });
  }

  // Update overall total price
  function updateOverallTotalPrice() {
    let overallTotal = 0;

    totalPriceCells.forEach((cell) => {
      overallTotal += parseFloat(cell.textContent) || 0;
    });

    if (overallTotalCell) {
      overallTotalCell.textContent = overallTotal.toFixed(2);
    }
  }

  // Save table data to local storage
  function saveTableData() {
    const data = [];

    tableBody.querySelectorAll("tr").forEach((row) => {
      const rowData = {};

      // Save date input
      const dateInput = row.querySelector(".dateInput");
      rowData.date = dateInput ? dateInput.value : "";

      // Save other inputs
      rowData.values = [];
      row.querySelectorAll("input:not(.dateInput)").forEach((input) => {
        rowData.values.push(input.value || "0");
      });

      data.push(rowData);
    });

    // Save header values
    const headerValues = [];
    document.querySelectorAll(".headerInput").forEach((input) => {
      headerValues.push(input.value || "0");
    });

    localStorage.setItem("tableData", JSON.stringify(data));
    localStorage.setItem("headerValues", JSON.stringify(headerValues));
  }

  // Load table data from local storage
  function loadTableData() {
    const savedData = JSON.parse(localStorage.getItem("tableData")) || [];
    const headerValues = JSON.parse(localStorage.getItem("headerValues")) || [];

    // Load header values
    document.querySelectorAll(".headerInput").forEach((input, index) => {
      input.value = headerValues[index] || "0";
    });

    // Load table data
    savedData.forEach((rowData, rowIndex) => {
      const row = tableBody.children[rowIndex];
      if (row) {
        const dateInput = row.querySelector(".dateInput");
        if (dateInput) dateInput.value = rowData.date || `Row ${rowIndex + 1}`;

        rowData.values.forEach((value, colIndex) => {
          const input = row.querySelector(`input[data-row='${rowIndex + 1}'][data-col='${colIndex}']`);
          if (input) {
            input.value = value;

            // Apply color based on value
            updateCellColor(input);
          }
        });
      }
    });

    updateRowTotals();
    updateTotalPieces();
    updateTotalPrice();
    updateOverallTotalPrice();
  }

  // Initialize table and load data
  generateTable();
  loadTableData();
});