// Sample sweets items
const sweetsTemplate = [
    { description: 'Chocolate Icing Sweet', price: 440, quantity: 0 },
    { description: 'Ribbon Sweet', price: 340, quantity: 0 },
    { description: 'Red Velvet Sweet', price: 440, quantity: 0 },
    { description: 'Marble Sweet', price: 340, quantity: 0 },
    { description: 'Zebra Sweet', price: 380, quantity: 0 },
    { description: 'Box Sweet', price: 420, quantity: 0 },
    { description: 'Strawberry Sweet', price: 360, quantity: 0 },
    { description: 'Fruit Sweet', price: 350, quantity: 0 },
    { description: 'Date Sweet', price: 390, quantity: 0 },
    { description: 'Love Sweet', price: 400, quantity: 0 },
    { description: 'Chocolate Gateau', price: 480, quantity: 0 },
    { description: 'Chocolate Roll', price: 320, quantity: 0 },
    { description: 'Vanilla Roll', price: 300, quantity: 0 },
    { description: 'Strawberry Roll', price: 330, quantity: 0 },
    { description: 'Cup Sweet', price: 280, quantity: 0 }
];

let items = [];
let itemIdCounter = 0;

// Initialize on page load
window.onload = function () {
    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('invoiceDate').value = today;

    // Load saved data or add one empty item
    loadData();
    if (items.length === 0) {
        addItem();
    }
};

// Add new item row
function addItem(description = '', price = 0, quantity = 0) {
    const id = itemIdCounter++;
    const item = { id, description, price, quantity };
    items.push(item);

    const tbody = document.getElementById('itemsBody');
    const row = tbody.insertRow();
    row.id = `item-${id}`;

    row.className = "border-b border-gray-200 hover:bg-gray-50 transition-colors print:text-xs";
    row.innerHTML = `
        <td class="p-3 print:p-2">
            <input type="text" value="${description}" placeholder="Enter item description" onchange="updateItem(${id}, 'description', this.value)" 
                   class="w-full px-2 py-2 border border-gray-200 rounded focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none">
        </td>
        <td class="p-3 text-right print:p-2">
            <input type="number" value="${price}" min="0" step="10" placeholder="0" onchange="updateItem(${id}, 'price', this.value)" 
                   class="w-full px-2 py-2 border border-gray-200 rounded text-right focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none">
        </td>
        <td class="p-3 text-right print:p-2">
            <input type="number" value="${quantity}" min="0" placeholder="0" onchange="updateItem(${id}, 'quantity', this.value)" 
                   class="w-full px-2 py-2 border border-gray-200 rounded text-right focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none">
        </td>
        <td class="p-3 text-right font-semibold text-gray-800 print:p-2" id="amount-${id}">Rs. ${calculateAmount(price, quantity)}</td>
        <td class="p-3 text-center no-print print:p-2">
            <button class="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded transition-all hover:scale-105" onclick="deleteItem(${id})">
                🗑️ Delete
            </button>
        </td>
    `;

    updateTotal();
    return id;
}

// Update item property
function updateItem(id, property, value) {
    const item = items.find(i => i.id === id);
    if (item) {
        item[property] = property === 'description' ? value : parseFloat(value) || 0;

        // Update amount display
        const amountCell = document.getElementById(`amount-${id}`);
        if (amountCell) {
            amountCell.textContent = `Rs. ${calculateAmount(item.price, item.quantity)}`;
        }

        updateTotal();
        saveData();
    }
}

// Delete item
function deleteItem(id) {
    items = items.filter(i => i.id !== id);
    const row = document.getElementById(`item-${id}`);
    if (row) {
        row.remove();
    }
    updateTotal();
    saveData();
}

// Calculate amount for an item
function calculateAmount(price, quantity) {
    const amount = (parseFloat(price) || 0) * (parseFloat(quantity) || 0);
    return amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Update total
function updateTotal() {
    const total = items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);

    document.getElementById('totalAmount').textContent =
        `Rs. ${total.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Save invoice data to localStorage
function saveData() {
    const invoiceData = {
        invoiceNumber: document.getElementById('invoiceNumber').value,
        invoiceDate: document.getElementById('invoiceDate').value,
        customerName: document.getElementById('customerName').value,
        customerAddress: document.getElementById('customerAddress').value,
        customerPhone: document.getElementById('customerPhone').value,
        items: items
    };

    localStorage.setItem('hjsweets_invoice', JSON.stringify(invoiceData));
}

// Load invoice data from localStorage
function loadData() {
    const saved = localStorage.getItem('hjsweets_invoice');
    if (saved) {
        try {
            const invoiceData = JSON.parse(saved);
            document.getElementById('invoiceNumber').value = invoiceData.invoiceNumber || '0001';
            document.getElementById('invoiceDate').value = invoiceData.invoiceDate || new Date().toISOString().split('T')[0];
            document.getElementById('customerName').value = invoiceData.customerName || '';
            document.getElementById('customerAddress').value = invoiceData.customerAddress || '';
            document.getElementById('customerPhone').value = invoiceData.customerPhone || '';

            // Clear existing items
            items = [];
            document.getElementById('itemsBody').innerHTML = '';

            // Restore items
            if (invoiceData.items && invoiceData.items.length > 0) {
                invoiceData.items.forEach(item => {
                    addItem(item.description, item.price, item.quantity);
                });
            }
        } catch (e) {
            console.error('Error loading saved data:', e);
        }
    }
}

// Save invoice as JSON file
function saveInvoice() {
    const invoiceData = {
        invoiceNumber: document.getElementById('invoiceNumber').value,
        invoiceDate: document.getElementById('invoiceDate').value,
        customerName: document.getElementById('customerName').value,
        customerAddress: document.getElementById('customerAddress').value,
        customerPhone: document.getElementById('customerPhone').value,
        items: items,
        total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };

    const dataStr = JSON.stringify(invoiceData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `invoice_${invoiceData.invoiceNumber}_${invoiceData.invoiceDate}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    alert('Invoice saved! 💾');
}

// Load template with predefined sweets
function loadTemplate() {
    if (confirm('Load sweets template? This will replace current items.')) {
        // Clear existing items
        items = [];
        document.getElementById('itemsBody').innerHTML = '';
        itemIdCounter = 0;

        // Add template items
        sweetsTemplate.forEach(item => {
            addItem(item.description, item.price, item.quantity);
        });

        alert('Template loaded! Add quantities as needed. 🍰');
    }
}

// Auto-save every 30 seconds
setInterval(saveData, 30000);
