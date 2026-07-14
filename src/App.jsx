import { useState, useEffect } from 'react';
import './App.css';

// Part 2 - Step 1: Tax rates object
const taxRates = {
  general: 0.18,
  materials: 0.28,
  services: 0.12,
};

// Part 2 - Step 11-13: Auto-detect category from description keywords
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

// Part 1 - Step 16: Calculate item total
function calculateItemTotal(quantity, price) {
  return Number(quantity) * Number(price);
}

// Generate unique IDs for items
let nextId = 2;
function generateId() {
  return nextId++;
}

function App() {
  // Part 1 - Steps 7 & 8: Invoice number and date state
  const [invoiceNumber, setInvoiceNumber] = useState('INV-001');
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Part 1 - Step 9: Client information state
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  // Part 1 - Step 11 & Part 2 - Step 2: invoiceItems state with category
  const [invoiceItems, setInvoiceItems] = useState([
    {
      id: 1,
      description: '',
      quantity: 1,
      price: 0,
      category: 'general',        // Part 2 - Step 2
      autoDetected: false,         // Part 2 - Step 16: track auto-detection
    },
  ]);

  // Part 1 - Step 18: Subtotal state
  const [subtotal, setSubtotal] = useState(0);

  // Part 2 - Step 5: totalGST state
  const [totalGST, setTotalGST] = useState(0);

  // Grand total state
  const [grandTotal, setGrandTotal] = useState(0);

  // Part 1 - Step 18 & Part 2 - Steps 6-8: useEffect to recalculate all totals
  useEffect(() => {
    // Calculate subtotal
    const newSubtotal = invoiceItems.reduce((sum, item) => {
      return sum + calculateItemTotal(item.quantity, item.price);
    }, 0);

    // Part 2 - Step 7: Calculate total GST
    const newGST = invoiceItems.reduce((sum, item) => {
      const rate = taxRates[item.category] || taxRates.general;
      return sum + calculateItemTotal(item.quantity, item.price) * rate;
    }, 0);

    // Part 2 - Step 8: Grand total = subtotal + GST
    const newGrandTotal = newSubtotal + newGST;

    setSubtotal(newSubtotal);
    setTotalGST(newGST);
    setGrandTotal(newGrandTotal);
  }, [invoiceItems]);

  // Part 1 - Step 13: Update handler for item fields
  const handleItemChange = (id, field, value) => {
    setInvoiceItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id !== id) return item;

        // Part 2 - Steps 14-15: Auto-detect category when description changes
        if (field === 'description') {
          const detectedCategory = autoDetectCategory(value);
          const wasAutoDetected = detectedCategory !== 'general' || value === '';
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

  // Part 2 - Step 4: Handle category dropdown change
  const handleCategoryChange = (id, value) => {
    setInvoiceItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, category: value, autoDetected: false } : item
      )
    );
  };

  // Part 1 - Step 15: Add new item logic
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

  // Part 2 - Step 20: Remove item logic
  const handleRemoveItem = (id) => {
    setInvoiceItems((prevItems) => prevItems.filter((item) => item.id !== id));
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
          <h1 className="invoice-title">Invoice Generator</h1>
          <p className="invoice-subtitle">Professional invoices in seconds</p>
        </div>

        {/* Part 1 - Step 6: Invoice Header Section */}
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
            {/* Part 1 - Step 8: Date input */}
            <input
              id="invoice-date"
              type="date"
              className="field-input"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
          </div>
        </div>

        {/* Part 1 - Step 9: Client Information Section */}
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

        {/* Part 1 - Steps 10-13: Items Table */}
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

            {/* Part 1 - Step 12: Map items to rows */}
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

                {/* Part 2 - Step 3: Category dropdown */}
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
                    {/* Part 2 - Step 16: Auto-detected badge */}
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

                {/* Part 1 - Step 17: Dynamic total using calculateItemTotal */}
                <div className="col-total">
                  <span className="item-total">
                    ₹{calculateItemTotal(item.quantity, item.price).toFixed(2)}
                  </span>
                </div>

                {/* Part 2 - Step 20: Remove button */}
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

          {/* Part 1 - Step 14: Add New Item button */}
          <button
            id="add-item-btn"
            className="btn-add-item"
            onClick={handleAddItem}
          >
            <span className="btn-icon">+</span>
            Add New Item
          </button>
        </div>

        {/* Part 1 - Steps 19-20 & Part 2 - Steps 9-10 & 17: Totals Summary */}
        <div className="totals-card">
          <h2 className="section-title">
            <span className="section-icon">🧾</span>
            Summary
          </h2>

          <div className="totals-breakdown">
            <div className="total-row">
              <span className="total-label">Subtotal</span>
              <span className="total-value">₹{subtotal.toFixed(2)}</span>
            </div>

            {/* Part 2 - Step 9: Display GST breakdown per category */}
            <div className="gst-breakdown">
              {Object.keys(taxRates).map((cat) => {
                const catItems = invoiceItems.filter((i) => i.category === cat);
                const catGST = catItems.reduce((sum, item) => {
                  return sum + calculateItemTotal(item.quantity, item.price) * taxRates[cat];
                }, 0);
                if (catGST === 0) return null;
                return (
                  <div key={cat} className="total-row gst-row">
                    <span className="total-label gst-label">
                      GST – {cat.charAt(0).toUpperCase() + cat.slice(1)} ({(taxRates[cat] * 100).toFixed(0)}%)
                    </span>
                    <span className="total-value gst-value">₹{catGST.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

            <div className="total-row gst-total-row">
              <span className="total-label">Total GST</span>
              <span className="total-value">₹{totalGST.toFixed(2)}</span>
            </div>

            <div className="divider"></div>

            <div className="total-row grand-total-row">
              <span className="grand-label">Grand Total</span>
              <span className="grand-value">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="invoice-actions">
          <button id="print-btn" className="btn-print" onClick={() => window.print()}>
            🖨️ Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
