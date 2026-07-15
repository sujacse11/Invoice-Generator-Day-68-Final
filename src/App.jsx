import { useState, useEffect } from 'react';
//Part 3 - Task 2: import jsPDF from 'jspdf'; and 'jspdf-autotable
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './App.css';

// Part 3 - Task 15: Currency options map
const currencyOptions = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee (₹)' },
  { code: 'USD', symbol: '$', label: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', label: 'Euro (€)' },
  { code: 'GBP', symbol: '£', label: 'British Pound (£)' },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham (د.إ)' },
];

// Part 2 - Task 1: Tax rates object
const taxRates = {
  general: 0.18,
  materials: 0.28,
  services: 0.12,
};

// Part 2 - Task 11-13: Auto-detect category from description keywords
function autoDetectCategory(description) {
  const lower = description.toLowerCase();
  if (
    lower.includes('cement') ||
    lower.includes('steel') ||
    lower.includes('brick') ||
    lower.includes('concrete') ||
    lower.includes('wood') ||
    lower.includes('timber') ||
    lower.includes('iron') ||
    lower.includes('copper') ||
    lower.includes('aluminum') ||
    lower.includes('glass') ||
    lower.includes('paint')
  ) {
    return 'materials';
  } else if (
    lower.includes('consulting') ||
    lower.includes('service') ||
    lower.includes('repair') ||
    lower.includes('maintenance') ||
    lower.includes('installation') ||
    lower.includes('design') ||
    lower.includes('support') ||
    lower.includes('audit') ||
    lower.includes('advisory')
  ) {
    return 'services';
  }
  return 'general';
}

// Part 1 - Task 16: Calculate item total
function calculateItemTotal(quantity, price) {
  return Number(quantity) * Number(price);
}

// Generate unique IDs for items
let nextId = 2;
function generateId() {
  return nextId++;
}

function App() {
  // Part 1 - Tasks 7 & 8: Invoice number and date state
  const [invoiceNumber, setInvoiceNumber] = useState('INV-001');
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Part 1 - Task 9: Client information state
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  // Part 3 - Task 1: Company name state
  const [companyName, setCompanyName] = useState('');

  // Part 3 - Task 2: Company address state
  const [companyAddress, setCompanyAddress] = useState('');

  // Part 3 - Task 3: Company phone state
  const [companyPhone, setCompanyPhone] = useState('');

  // Part 3 - Task 4: Company email state
  const [companyEmail, setCompanyEmail] = useState('');

  // Part 3 - Task 6: Discount percentage state
  const [discountPercent, setDiscountPercent] = useState(0);

  // Part 3 - Task 12: Notes state
  const [notes, setNotes] = useState('');

  // Part 3 - Task 13: Payment terms state
  const [paymentTerms, setPaymentTerms] = useState('Net 30');

  // Part 3 - Task 15: Currency state
  const [currency, setCurrency] = useState('INR');

  // Part 1 - Task 11 & Part 2 - Task 2: invoiceItems state with category
  const [invoiceItems, setInvoiceItems] = useState([
    {
      id: 1,
      description: '',
      quantity: 1,
      price: 0,
      category: 'general',        // Part 2 - Task 2
      autoDetected: false,         // Part 2 - Task 16: track auto-detection
    },
  ]);

  // Part 1 - Task 18: Subtotal state
  const [subtotal, setSubtotal] = useState(0);

  // Part 3 - Task 7: Discount amount state
  const [discountAmount, setDiscountAmount] = useState(0);

  // Part 3 - Task 8: Discounted subtotal state
  const [discountedSubtotal, setDiscountedSubtotal] = useState(0);

  // Part 2 - Task 5: totalGST state
  const [totalGST, setTotalGST] = useState(0);

  // Grand total state
  const [grandTotal, setGrandTotal] = useState(0);

  // Part 3 - Task 17: Helper to get selected currency symbol
  const getCurrencySymbol = () => {
    return currencyOptions.find((c) => c.code === currency)?.symbol || '₹';
  };

  // Part 1 - Task 18 & Part 2 - Tasks 6-8 & Part 3 - Tasks 8-10: useEffect to recalculate all totals
  useEffect(() => {
    // Calculate subtotal
    const newSubtotal = invoiceItems.reduce((sum, item) => {
      return sum + calculateItemTotal(item.quantity, item.price);
    }, 0);

    // Part 3 - Task 7: Calculate discount amount
    const newDiscountAmount = newSubtotal * (Number(discountPercent) / 100);

    // Part 3 - Task 8: Discounted subtotal
    const newDiscountedSubtotal = newSubtotal - newDiscountAmount;

    // Part 3 - Task 9: Calculate GST on discounted subtotal (proportional)
    const newGST = invoiceItems.reduce((sum, item) => {
      const rate = taxRates[item.category] || taxRates.general;
      const itemTotal = calculateItemTotal(item.quantity, item.price);
      // Apply discount proportion to each item
      const discountRatio = newSubtotal > 0 ? newDiscountedSubtotal / newSubtotal : 1;
      return sum + itemTotal * discountRatio * rate;
    }, 0);

    // Part 3 - Task 10: Grand total = discounted subtotal + GST
    const newGrandTotal = newDiscountedSubtotal + newGST;

    setSubtotal(newSubtotal);
    setDiscountAmount(newDiscountAmount);
    setDiscountedSubtotal(newDiscountedSubtotal);
    setTotalGST(newGST);
    setGrandTotal(newGrandTotal);
  }, [invoiceItems, discountPercent]);

  // Part 1 - Task 13: Update handler for item fields
  const handleItemChange = (id, field, value) => {
    setInvoiceItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id !== id) return item;

        // Part 2 - Tasks 14-15: Auto-detect category when description changes
        if (field === 'description') {
          const detectedCategory = autoDetectCategory(value);
          return {
            ...item,
            description: value,
            category: detectedCategory,
            autoDetected: detectedCategory !== 'general' && value.length > 0,
          };
        }

        return { ...item, [field]: value };
      })
    );
  };

  // Part 2 - Task 4: Handle category dropdown change
  const handleCategoryChange = (id, value) => {
    setInvoiceItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, category: value, autoDetected: false } : item
      )
    );
  };

  // Part 1 - Task 15: Add new item logic
  const handleAddItem = () => {
    const newItem = {
      id: generateId(),
      description: '',
      quantity: 1,
      price: 0,
      category: 'general',
      autoDetected: false,
    };
    setInvoiceItems((prevItems) => [...prevItems, newItem]);
  };

  // Part 2 - Task 20: Remove item logic
  const handleRemoveItem = (id) => {
    setInvoiceItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // Day 68 - Tasks 4-11 & Part 3 - Tasks 18-20: Generate PDF function
  const generatePDF = () => {
    console.log('Generating PDF...');

    // Task 5: Initialize jsPDF
    const doc = new jsPDF();
    const sym = getCurrencySymbol(); // Part 3 - Task 20: use selected currency symbol in PDF

    // Colours & fonts
    const purple = [99, 102, 241];
    const gold = [245, 158, 11];
    const dark = [22, 25, 40];
    const grey = [100, 116, 139];
    const green = [16, 185, 129];

    // ── Header background bar ────────────────────────────────────────────
    doc.setFillColor(...purple);
    doc.rect(0, 0, 210, 42, 'F');

    // Task 6: Add Invoice Header
    // Part 3 - Task 18: Show company name in PDF header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('INVOICE', 14, 16);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 240);
    doc.text(companyName || 'Professional Invoice Generator', 14, 23);
    if (companyAddress) {
      doc.setFontSize(8);
      doc.text(companyAddress, 14, 29);
    }
    if (companyPhone || companyEmail) {
      doc.setFontSize(8);
      doc.text([companyPhone, companyEmail].filter(Boolean).join('  |  '), 14, 35);
    }

    // Invoice number & date (top-right)
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(`Invoice #: ${invoiceNumber}`, 196, 14, { align: 'right' });
    doc.text(`Date: ${invoiceDate}`, 196, 22, { align: 'right' });
    // Part 3 - Task 19: Payment terms in PDF
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(200, 200, 240);
    doc.text(`Terms: ${paymentTerms}`, 196, 30, { align: 'right' });
    doc.text(`Currency: ${currency}`, 196, 37, { align: 'right' });

    // ── Client Information ────────────────────────────────────────────────
    // Task 7: Add Client Information
    doc.setFillColor(240, 242, 255);
    doc.rect(14, 48, 182, 22, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...grey);
    doc.text('BILL TO', 18, 55);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...dark);
    doc.text(clientName || 'Client Name', 18, 62);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...grey);
    doc.text(clientAddress || 'Client Address', 18, 67);

    // ── Items Table ───────────────────────────────────────────────────────
    // Task 8: Prepare table data
    // Task 9: Generate table with autoTable
    const tableBody = invoiceItems.map((item) => [
      item.description || '-',
      `${item.category.charAt(0).toUpperCase() + item.category.slice(1)} (${(taxRates[item.category] * 100).toFixed(0)}%)`,
      Number(item.quantity).toString(),
      // Part 3 - Task 20: Use selected currency symbol for unit price
      `${sym}${Number(item.price).toFixed(2)}`,
      `${sym}${calculateItemTotal(item.quantity, item.price).toFixed(2)}`,
    ]);

    doc.autoTable({
      startY: 76,
      head: [['Description', 'Category (GST)', 'Qty', 'Unit Price', 'Total']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: purple,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: dark,
      },
      alternateRowStyles: {
        fillColor: [248, 248, 255],
      },
      columnStyles: {
        0: { cellWidth: 65 },
        1: { cellWidth: 40 },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 32, halign: 'right' },
        4: { cellWidth: 27, halign: 'right' },
      },
      margin: { left: 14, right: 14 },
    });

    // ── Totals Section ────────────────────────────────────────────────────
    // Task 10: Add Total Rows
    const finalY = doc.lastAutoTable.finalY + 8;
    const rightX = 196;
    const labelX = 130;

    // Subtotal row
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...grey);
    doc.text('Subtotal:', labelX, finalY);
    doc.setTextColor(...dark);
    doc.text(`${sym}${subtotal.toFixed(2)}`, rightX, finalY, { align: 'right' });

    let yOffset = finalY + 7;

    // Part 3 - Task 19: Discount row in PDF
    if (discountAmount > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...grey);
      doc.text(`Discount (${discountPercent}%):`, labelX, yOffset);
      doc.setTextColor(239, 68, 68);
      doc.text(`- ${sym}${discountAmount.toFixed(2)}`, rightX, yOffset, { align: 'right' });
      yOffset += 7;
    }

    // GST breakdown per category
    Object.keys(taxRates).forEach((cat) => {
      const catItems = invoiceItems.filter((i) => i.category === cat);
      const discountRatio = subtotal > 0 ? discountedSubtotal / subtotal : 1;
      const catGST = catItems.reduce((sum, item) => {
        return sum + calculateItemTotal(item.quantity, item.price) * discountRatio * taxRates[cat];
      }, 0);
      if (catGST > 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...grey);
        doc.text(
          `GST – ${cat.charAt(0).toUpperCase() + cat.slice(1)} (${(taxRates[cat] * 100).toFixed(0)}%):`,
          labelX,
          yOffset
        );
        // Part 3 - Task 20: Currency symbol in GST rows
        doc.text(`${sym}${catGST.toFixed(2)}`, rightX, yOffset, { align: 'right' });
        yOffset += 6;
      }
    });

    // Total GST row
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...grey);
    doc.text('Total GST:', labelX, yOffset + 1);
    doc.setTextColor(...green);
    doc.text(`${sym}${totalGST.toFixed(2)}`, rightX, yOffset + 1, { align: 'right' });

    // Divider
    yOffset += 7;
    doc.setDrawColor(...purple);
    doc.setLineWidth(0.5);
    doc.line(labelX, yOffset, 196, yOffset);
    yOffset += 6;

    // Grand Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...dark);
    doc.text('GRAND TOTAL:', labelX, yOffset);
    doc.setTextColor(...gold);
    doc.text(`${sym}${grandTotal.toFixed(2)}`, rightX, yOffset, { align: 'right' });

    // ── Footer ────────────────────────────────────────────────────────────
    // Part 3 - Task 19: Notes in PDF footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setDrawColor(...purple);
    doc.setLineWidth(0.3);
    doc.line(14, pageHeight - 24, 196, pageHeight - 24);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...grey);
    if (notes) {
      doc.text(`Notes: ${notes}`, 14, pageHeight - 18);
    }
    doc.text('Thank you for your business!', 105, pageHeight - 10, { align: 'center' });

    // Task 11: Save the PDF
    doc.save(`invoice-${invoiceNumber}.pdf`);
  };

  return (
    <div className="app-wrapper">
      <div className="invoice-container">
        {/* Decorative gradient orbs */}
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>

        {/* Form Title */}
        <div className="invoice-title-block">
          <div className="invoice-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#logoGrad)" />
              <path d="M8 10h16M8 16h12M8 22h8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="invoice-title">Online Invoice Generator</h1>
          
        </div>

        {/* Part 3 - Task 5: Company Information Section */}
        <div className="section-card company-section">
          <h2 className="section-title">
            <span className="section-icon">🏢</span>
            Company Information
          </h2>
          <div className="company-fields">
            {/* Part 3 - Task 1: Company Name */}
            <div className="field-group">
              <label className="field-label">Company Name</label>
              <input
                id="company-name"
                type="text"
                className="field-input"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your Company Ltd."
              />
            </div>
            {/* Part 3 - Task 2: Company Address */}
            <div className="field-group">
              <label className="field-label">Company Address</label>
              <input
                id="company-address"
                type="text"
                className="field-input"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                placeholder="123 Business Street, City"
              />
            </div>
            {/* Part 3 - Task 3: Company Phone */}
            <div className="field-group">
              <label className="field-label">Phone Number</label>
              <input
                id="company-phone"
                type="tel"
                className="field-input"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
            {/* Part 3 - Task 4: Company Email */}
            <div className="field-group">
              <label className="field-label">Email Address</label>
              <input
                id="company-email"
                type="email"
                className="field-input"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                placeholder="billing@company.com"
              />
            </div>
          </div>
        </div>

        {/* Part 3 - Task 16: Currency Selector */}
        <div className="section-card currency-section">
          <h2 className="section-title">
            <span className="section-icon">💱</span>
            Currency
          </h2>
          <div className="currency-select-wrapper">
            <select
              id="currency-select"
              className="field-input currency-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {currencyOptions.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="currency-preview">
              <span className="currency-symbol-badge">{getCurrencySymbol()}</span>
              <span className="currency-code-label">{currency}</span>
            </div>
          </div>
        </div>

        {/* Part 1 - Task 6: Invoice Header Section */}
        <div className="invoice-header">
          <div className="field-group">
            <label className="field-label">Invoice Number</label>
            <input
              id="invoice-number"
              type="text"
              className="field-input"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="INV-001"
            />
          </div>
          <div className="field-group">
            <label className="field-label">Invoice Date</label>
            {/* Part 1 - Task 8: Date input */}
            <input
              id="invoice-date"
              type="date"
              className="field-input"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
          </div>
        </div>

        {/* Part 1 - Task 9: Client Information Section */}
        <div className="section-card">
          <h2 className="section-title">
            <span className="section-icon">👤</span>
            Client Information
          </h2>
          <div className="client-fields">
            <div className="field-group">
              <label className="field-label">Client Name</label>
              <input
                id="client-name"
                type="text"
                className="field-input"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Enter client name"
              />
            </div>
            <div className="field-group">
              <label className="field-label">Client Address</label>
              <input
                id="client-address"
                type="text"
                className="field-input"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder="Enter client address"
              />
            </div>
          </div>
        </div>

        {/* Part 1 - Tasks 10-13: Items Table */}
        <div className="section-card items-section">
          <h2 className="section-title">
            <span className="section-icon">📋</span>
            Invoice Items
          </h2>

          <div className="items-table">
            {/* Table Header */}
            <div className="items-header">
              <div className="col-desc">Description</div>
              <div className="col-cat">Category</div>
              <div className="col-qty">Qty</div>
              <div className="col-price">Unit Price (₹)</div>
              <div className="col-total">Total (₹)</div>
              <div className="col-action"></div>
            </div>

            {/* Part 1 - Task 12: Map items to rows */}
            {invoiceItems.map((item) => (
              <div key={item.id} className="item-row">
                {/* Description */}
                <div className="col-desc">
                  <input
                    id={`desc-${item.id}`}
                    type="text"
                    className="item-input"
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                    placeholder="Item description..."
                  />
                </div>

                {/* Part 2 - Task 3: Category dropdown */}
                <div className="col-cat">
                  <div className="cat-wrapper">
                    <select
                      id={`cat-${item.id}`}
                      className="item-select"
                      value={item.category}
                      onChange={(e) => handleCategoryChange(item.id, e.target.value)}
                    >
                      {Object.keys(taxRates).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)} ({(taxRates[cat] * 100).toFixed(0)}%)
                        </option>
                      ))}
                    </select>
                    {/* Part 2 - Task 16: Auto-detected badge */}
                    {item.autoDetected && (
                      <span className="auto-badge">✨ Auto-detected</span>
                    )}
                  </div>
                </div>

                {/* Quantity */}
                <div className="col-qty">
                  <input
                    id={`qty-${item.id}`}
                    type="number"
                    className="item-input text-center"
                    value={item.quantity}
                    min="1"
                    onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                  />
                </div>

                {/* Price */}
                <div className="col-price">
                  <input
                    id={`price-${item.id}`}
                    type="number"
                    className="item-input"
                    value={item.price}
                    min="0"
                    step="0.01"
                    onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                {/* Part 1 - Task 17: Dynamic total using calculateItemTotal */}
                <div className="col-total">
                  <span className="item-total">
                    ₹{calculateItemTotal(item.quantity, item.price).toFixed(2)}
                  </span>
                </div>

                {/* Part 2 - Task 20: Remove button */}
                <div className="col-action">
                  <button
                    id={`remove-${item.id}`}
                    className="btn-remove"
                    onClick={() => handleRemoveItem(item.id)}
                    title="Remove item"
                    disabled={invoiceItems.length === 1}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Part 1 - Task 14: Add New Item button */}
          <button
            id="add-item-btn"
            className="btn-add-item"
            onClick={handleAddItem}
          >
            <span className="btn-icon">+</span>
            Add New Item
          </button>
        </div>

        {/* Part 3 - Task 6: Discount Section */}
        <div className="section-card discount-section">
          <h2 className="section-title">
            <span className="section-icon">🏷️</span>
            Discount
          </h2>
          <div className="discount-field-row">
            <div className="field-group discount-group">
              <label className="field-label">Discount (%)</label>
              <div className="discount-input-wrapper">
                <input
                  id="discount-percent"
                  type="number"
                  className="field-input discount-input"
                  value={discountPercent}
                  min="0"
                  max="100"
                  step="0.5"
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  placeholder="0"
                />
                <span className="discount-pct-symbol">%</span>
              </div>
            </div>
            {/* Part 3 - Task 11: Show discount amount preview */}
            {discountAmount > 0 && (
              <div className="discount-preview">
                <span className="discount-preview-label">You save</span>
                <span className="discount-preview-amount">− {getCurrencySymbol()}{discountAmount.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Part 1 - Tasks 19-20 & Part 2 - Tasks 9-10 & 17 & Part 3 - Tasks 11: Totals Summary */}
        <div className="totals-card">
          <h2 className="section-title">
            <span className="section-icon">🧾</span>
            Summary
          </h2>

          <div className="totals-breakdown">
            <div className="total-row">
              <span className="total-label">Subtotal</span>
              {/* Part 3 - Task 17: Use selected currency symbol */}
              <span className="total-value">{getCurrencySymbol()}{subtotal.toFixed(2)}</span>
            </div>

            {/* Part 3 - Task 11: Discount row */}
            {discountAmount > 0 && (
              <div className="total-row discount-row">
                <span className="total-label discount-label">Discount ({discountPercent}%)</span>
                <span className="total-value discount-value">− {getCurrencySymbol()}{discountAmount.toFixed(2)}</span>
              </div>
            )}

            {/* Part 2 - Task 9: Display GST breakdown per category */}
            <div className="gst-breakdown">
              {Object.keys(taxRates).map((cat) => {
                const catItems = invoiceItems.filter((i) => i.category === cat);
                const discountRatio = subtotal > 0 ? discountedSubtotal / subtotal : 1;
                const catGST = catItems.reduce((sum, item) => {
                  return sum + calculateItemTotal(item.quantity, item.price) * discountRatio * taxRates[cat];
                }, 0);
                if (catGST === 0) return null;
                return (
                  <div key={cat} className="total-row gst-row">
                    <span className="total-label gst-label">
                      GST – {cat.charAt(0).toUpperCase() + cat.slice(1)} ({(taxRates[cat] * 100).toFixed(0)}%)
                    </span>
                    <span className="total-value gst-value">{getCurrencySymbol()}{catGST.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

            <div className="total-row gst-total-row">
              <span className="total-label">Total GST</span>
              <span className="total-value">{getCurrencySymbol()}{totalGST.toFixed(2)}</span>
            </div>

            <div className="divider"></div>

            <div className="total-row grand-total-row">
              <span className="grand-label">Grand Total</span>
              <span className="grand-value">{getCurrencySymbol()}{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Part 3 - Tasks 14: Notes & Payment Terms Section */}
        <div className="section-card notes-section">
          <h2 className="section-title">
            <span className="section-icon">📝</span>
            Notes &amp; Terms
          </h2>
          <div className="notes-fields">
            {/* Part 3 - Task 12: Notes textarea */}
            <div className="field-group">
              <label className="field-label">Notes</label>
              <textarea
                id="invoice-notes"
                className="field-input notes-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes for the client..."
                rows={3}
              />
            </div>
            {/* Part 3 - Task 13: Payment terms */}
            <div className="field-group">
              <label className="field-label">Payment Terms</label>
              <select
                id="payment-terms"
                className="field-input payment-terms-select"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
              >
                <option value="Due on Receipt">Due on Receipt</option>
                <option value="Net 7">Net 7</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 60">Net 60</option>
                <option value="Net 90">Net 90</option>
              </select>
            </div>
          </div>
        </div>

        {/* Day 68 - Tasks 13-17: Invoice Summary Section */}
        <div className="invoice-summary">
          {/* Task 14: Summary Title */}
          <div className="summary-header">
            <div className="summary-header-left">
              <span className="summary-icon">📄</span>
              <div>
                <h2 className="summary-title">Invoice Summary</h2>
                <p className="summary-subtitle">Complete overview of this invoice</p>
              </div>
            </div>
            <div className="summary-badge">READY</div>
          </div>

          <div className="summary-body">
            {/* Task 15: Display Key Details */}
            <div className="summary-details-grid">
              {/* Part 3 - Tasks 1-5: Show company info in summary */}
              {companyName && (
                <div className="summary-detail-card">
                  <span className="summary-detail-label">Company</span>
                  <span className="summary-detail-value">{companyName}</span>
                </div>
              )}
              <div className="summary-detail-card">
                <span className="summary-detail-label">Invoice Number</span>
                <span className="summary-detail-value">{invoiceNumber || '—'}</span>
              </div>
              <div className="summary-detail-card">
                <span className="summary-detail-label">Invoice Date</span>
                <span className="summary-detail-value">{invoiceDate || '—'}</span>
              </div>
              <div className="summary-detail-card">
                <span className="summary-detail-label">Client Name</span>
                <span className="summary-detail-value">{clientName || '—'}</span>
              </div>
              <div className="summary-detail-card">
                <span className="summary-detail-label">Client Address</span>
                <span className="summary-detail-value">{clientAddress || '—'}</span>
              </div>
              {/* Part 3 - Task 13: Show payment terms in summary */}
              <div className="summary-detail-card">
                <span className="summary-detail-label">Payment Terms</span>
                <span className="summary-detail-value">{paymentTerms}</span>
              </div>
            </div>

            {/* Task 16: Display Final Totals */}
            <div className="summary-totals">
              <div className="summary-total-row">
                <span className="summary-total-label">Subtotal</span>
                {/* Part 3 - Task 17: Currency symbol in summary */}
                <span className="summary-total-amount">{getCurrencySymbol()}{subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="summary-total-row">
                  <span className="summary-total-label">Discount ({discountPercent}%)</span>
                  <span className="summary-total-amount summary-discount">− {getCurrencySymbol()}{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-total-row">
                <span className="summary-total-label">Total GST</span>
                <span className="summary-total-amount summary-gst">{getCurrencySymbol()}{totalGST.toFixed(2)}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-total-row summary-grand">
                <span className="summary-grand-label">Grand Total</span>
                <span className="summary-grand-amount">{getCurrencySymbol()}{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="invoice-actions">
          <button id="print-btn" className="btn-print" onClick={() => window.print()}>
            🖨️ Print Invoice
          </button>
          {/* Day 68 - Task 3 & 12: Export as PDF button linked to generatePDF */}
          <button id="export-pdf-btn" className="btn-pdf" onClick={generatePDF}>
            📄 Export as PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;

