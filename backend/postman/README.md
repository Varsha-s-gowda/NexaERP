# NexaERP Postman Collections

This folder contains Postman collections for testing the NexaERP backend API.

## Customer Module Collection

**File:** `NexaERP-Customers.postman_collection.json`

### Setup

1. **Import the Collection**
   - Open Postman
   - Click "Import" in the top left
   - Select `NexaERP-Customers.postman_collection.json`

2. **Configure Environment Variables**
   - Create a new environment in Postman
   - Add the following variables:
     - `baseURL`: Your API base URL (e.g., `http://localhost:3000`)
     - `token`: JWT token obtained from login
     - `customerId`: Will be auto-set after creating a customer

3. **Get Authentication Token**
   - First, login via the Auth endpoint to get your JWT token
   - Set the `token` environment variable with the received token

### Requests

The collection includes the following requests under the "Customers" folder:

1. **Create Customer** (POST)
   - Creates a new customer
   - Automatically saves the returned `id` to `customerId` environment variable

2. **Get All Customers** (GET)
   - Retrieves all customers

3. **Get Customer By ID** (GET)
   - Retrieves a specific customer using `{{customerId}}`

4. **Update Customer** (PUT)
   - Updates customer information using `{{customerId}}`

5. **Delete Customer** (DELETE)
   - Deletes a customer using `{{customerId}}`

### Execution Order

For sequential execution:

1. Set `baseURL` and `token` environment variables
2. Run "Create Customer" - this will auto-save the customer ID
3. Run "Get Customer By ID" - uses the auto-saved ID
4. Run "Update Customer" - uses the auto-saved ID
5. Run "Delete Customer" - uses the auto-saved ID

### Test Script

The "Create Customer" request includes a test script that automatically extracts and saves the customer ID:

```javascript
const response = pm.response.json();

if (response.success && response.data?.id) {
    pm.environment.set("customerId", response.data.id);
    console.log("Customer ID saved:", response.data.id);
} else {
    console.log("Failed to save customer ID");
}
```

This allows you to run the collection sequentially without manually copying IDs.

## Product Module Collection

**File:** `NexaERP-Products.postman_collection.json`

### Setup

1. **Import the Collection**
   - Open Postman
   - Click "Import" in the top left
   - Select `NexaERP-Products.postman_collection.json`

2. **Configure Environment Variables**
   - Create a new environment in Postman
   - Add the following variables:
     - `baseURL`: Your API base URL (e.g., `http://localhost:3000`)
     - `token`: JWT token obtained from login
     - `productId`: Will be auto-set after creating a product
     - `warehouseId`: ID of an existing warehouse (required for product creation)

3. **Get Authentication Token**
   - First, login via the Auth endpoint to get your JWT token
   - Set the `token` environment variable with the received token

### Requests

The collection includes the following requests under the "Products" folder:

1. **Create Product** (POST)
   - Creates a new product
   - Automatically saves the returned `id` to `productId` environment variable
   - Requires a valid `warehouseId`

2. **Get All Products** (GET)
   - Retrieves all products

3. **Get Product By ID** (GET)
   - Retrieves a specific product using `{{productId}}`

4. **Update Product** (PUT)
   - Updates product information using `{{productId}}`

5. **Delete Product** (DELETE)
   - Deletes a product using `{{productId}}`

### Execution Order

For sequential execution:

1. Set `baseURL`, `token`, and `warehouseId` environment variables
2. Run "Create Product" - this will auto-save the product ID
3. Run "Get Product By ID" - uses the auto-saved ID
4. Run "Update Product" - uses the auto-saved ID
5. Run "Delete Product" - uses the auto-saved ID

### Test Script

The "Create Product" request includes a test script that automatically extracts and saves the product ID:

```javascript
const response = pm.response.json();

if (response.success && response.data?.id) {
    pm.environment.set("productId", response.data.id);
    console.log("Product ID saved:", response.data.id);
} else {
    console.log("Failed to save product ID");
}
```

This allows you to run the collection sequentially without manually copying IDs.

## Warehouse Module Collection

**File:** `NexaERP-Warehouses.postman_collection.json`

### Setup

1. **Import the Collection**
   - Open Postman
   - Click "Import" in the top left
   - Select `NexaERP-Warehouses.postman_collection.json`

2. **Configure Environment Variables**
   - Create a new environment in Postman
   - Add the following variables:
     - `baseURL`: Your API base URL (e.g., `http://localhost:3000`)
     - `token`: JWT token obtained from login
     - `warehouseId`: Will be auto-set after creating a warehouse

3. **Get Authentication Token**
   - First, login via the Auth endpoint to get your JWT token
   - Set the `token` environment variable with the received token

### Requests

The collection includes the following requests under the "Warehouses" folder:

1. **Create Warehouse** (POST)
   - Creates a new warehouse
   - Automatically saves the returned `id` to `warehouseId` environment variable

2. **Get All Warehouses** (GET)
   - Retrieves all warehouses

3. **Get Warehouse By ID** (GET)
   - Retrieves a specific warehouse using `{{warehouseId}}`

4. **Update Warehouse** (PUT)
   - Updates warehouse information using `{{warehouseId}}`

5. **Delete Warehouse** (DELETE)
   - Deletes a warehouse using `{{warehouseId}}`

### Execution Order

For sequential execution:

1. Set `baseURL` and `token` environment variables
2. Run "Create Warehouse" - this will auto-save the warehouse ID
3. Run "Get Warehouse By ID" - uses the auto-saved ID
4. Run "Update Warehouse" - uses the auto-saved ID
5. Run "Delete Warehouse" - uses the auto-saved ID

### Test Script

The "Create Warehouse" request includes a test script that automatically extracts and saves the warehouse ID:

```javascript
const response = pm.response.json();

if (response.success && response.data?.id) {
    pm.environment.set("warehouseId", response.data.id);
    console.log("Warehouse ID saved:", response.data.id);
} else {
    console.log("Failed to save warehouse ID");
}
```

This allows you to run the collection sequentially without manually copying IDs.

## Stock Movement Module Collection

**File:** `NexaERP-StockMovements.postman_collection.json`

### Setup

1. **Import the Collection**
   - Open Postman
   - Click "Import" in the top left
   - Select `NexaERP-StockMovements.postman_collection.json`

2. **Configure Environment Variables**
   - Create a new environment in Postman
   - Add the following variables:
     - `baseURL`: Your API base URL (e.g., `http://localhost:3000`)
     - `token`: JWT token obtained from login
     - `productId`: ID of an existing product (required for stock movements)
     - `movementId`: Will be auto-set after creating a stock movement

3. **Get Authentication Token**
   - First, login via the Auth endpoint to get your JWT token
   - Set the `token` environment variable with the received token

### Requests

The collection includes the following requests under the "Stock Movements" folder:

1. **Create Stock IN** (POST)
   - Creates a stock IN movement to increase product stock
   - Automatically saves the returned `id` to `movementId` environment variable
   - Requires a valid `productId`

2. **Create Stock OUT** (POST)
   - Creates a stock OUT movement to decrease product stock
   - Validates sufficient stock is available before processing
   - Requires a valid `productId`

3. **Get All Movements** (GET)
   - Retrieves all stock movements

4. **Get Movement By ID** (GET)
   - Retrieves a specific stock movement using `{{movementId}}`

5. **Get Product History** (GET)
   - Retrieves stock movement history for a specific product using `{{productId}}`

### Execution Order

For sequential execution:

1. Set `baseURL`, `token`, and `productId` environment variables
2. Run "Create Stock IN" - this will auto-save the movement ID and increase stock
3. Run "Create Stock OUT" - this will decrease stock (ensure sufficient stock exists)
4. Run "Get Movement By ID" - uses the auto-saved ID
5. Run "Get Product History" - uses the productId to view all movements for that product

### Test Script

The "Create Stock IN" request includes a test script that automatically extracts and saves the movement ID:

```javascript
const response = pm.response.json();

if (response.success && response.data?.id) {
    pm.environment.set("movementId", response.data.id);
    console.log("Movement ID saved:", response.data.id);
} else {
    console.log("Failed to save movement ID");
}
```

This allows you to run the collection sequentially without manually copying IDs.

## Sales Challan Module Collection

**File:** `NexaERP-SalesChallans.postman_collection.json`

### Setup

1. **Import the Collection**
   - Open Postman
   - Click "Import" in the top left
   - Select `NexaERP-SalesChallans.postman_collection.json`

2. **Configure Environment Variables**
   - Create a new environment in Postman
   - Add the following variables:
     - `baseURL`: Your API base URL (e.g., `http://localhost:3000`)
     - `token`: JWT token obtained from login
     - `customerId`: ID of an existing customer (required for challan creation)
     - `productId`: ID of first product (required for challan items)
     - `productId2`: ID of second product (optional, for multiple items)
     - `challanId`: Will be auto-set after creating a challan

3. **Get Authentication Token**
   - First, login via the Auth endpoint to get your JWT token
   - Set the `token` environment variable with the received token

### Requests

The collection includes the following requests under the "Sales Challans" folder:

1. **Create Challan** (POST)
   - Creates a new sales challan with items
   - Automatically generates challan number (CH-000001, CH-000002, etc.)
   - Validates customer and product existence
   - Checks sufficient stock before creation
   - Automatically reduces product stock
   - Calculates total quantity and total amount
   - Stores product snapshot (code, name, price)
   - Automatically saves the returned `id` to `challanId` environment variable

2. **Get All Challans** (GET)
   - Retrieves all sales challans from the system

3. **Get Challan By ID** (GET)
   - Retrieves a specific sales challan using `{{challanId}}`

4. **Update Status** (PATCH)
   - Updates the status of a sales challan
   - Valid statuses: DRAFT, CONFIRMED, CANCELLED
   - When status changes to CANCELLED, automatically restores stock
   - Uses `{{challanId}}`

### Execution Order

For sequential execution:

1. Set `baseURL`, `token`, `customerId`, and `productId` environment variables
2. Optionally set `productId2` for testing multiple items
3. Run "Create Challan" - this will auto-save the challan ID and reduce stock
4. Run "Get Challan By ID" - uses the auto-saved ID
5. Run "Update Status" - change to CONFIRMED or CANCELLED (cancelling restores stock)

### Test Script

The "Create Challan" request includes a test script that automatically extracts and saves the challan ID:

```javascript
const response = pm.response.json();

if (response.success && response.data?.id) {
    pm.environment.set("challanId", response.data.id);
    console.log("Challan ID saved:", response.data.id);
} else {
    console.log("Failed to save challan ID");
}
```

This allows you to run the collection sequentially without manually copying IDs.

## Dashboard Module Collection

**File:** `NexaERP-Dashboard.postman_collection.json`

### Setup

1. **Import the Collection**
   - Open Postman
   - Click "Import" in the top left
   - Select `NexaERP-Dashboard.postman_collection.json`

2. **Configure Environment Variables**
   - Create a new environment in Postman
   - Add the following variables:
     - `baseURL`: Your API base URL (e.g., `http://localhost:3000`)
     - `token`: JWT token obtained from login

3. **Get Authentication Token**
   - First, login via the Auth endpoint to get your JWT token
   - Set the `token` environment variable with the received token

### Requests

The collection includes the following requests under the "Dashboard" folder:

1. **Get Summary** (GET)
   - Retrieves comprehensive dashboard summary
   - Metrics include:
     - Total customers and active customers
     - Total products and low stock products count
     - Total warehouses
     - Total sales, confirmed sales, and cancelled sales
     - Total revenue and today's revenue

2. **Get Low Stock** (GET)
   - Retrieves products where stock quantity is at or below minimum stock level
   - Returns product details including current stock and minimum stock threshold
   - Useful for inventory management and reordering

3. **Get Monthly Sales** (GET)
   - Retrieves sales data grouped by month
   - Returns total sales count and revenue per month
   - Useful for sales trend analysis and reporting

### Execution

All dashboard endpoints are read-only and can be executed independently after setting the `baseURL` and `token` environment variables.

## Reports Module Collection

**File:** `NexaERP-Reports.postman_collection.json`

### Setup

1. **Import the Collection**
   - Open Postman
   - Click "Import" in the top left
   - Select `NexaERP-Reports.postman_collection.json`

2. **Configure Environment Variables**
   - Create a new environment in Postman
   - Add the following variables:
     - `baseURL`: Your API base URL (e.g., `http://localhost:3000`)
     - `token`: JWT token obtained from login

3. **Get Authentication Token**
   - First, login via the Auth endpoint to get your JWT token
   - Set the `token` environment variable with the received token

### Requests

The collection includes the following requests under the "Reports" folder:

1. **Sales Report** (GET)
   - Retrieves sales report with optional filters
   - Supported query parameters:
     - `startDate`: Filter by start date (YYYY-MM-DD)
     - `endDate`: Filter by end date (YYYY-MM-DD)
     - `customerId`: Filter by specific customer
     - `status`: Filter by status (DRAFT, CONFIRMED, CANCELLED)
   - Returns challan details with customer information

2. **Inventory Report** (GET)
   - Retrieves comprehensive inventory report
   - Includes current stock, minimum stock, warehouse information
   - Calculates total inventory value (purchase price × quantity)
   - Sorted by stock quantity ascending

3. **Customer Report** (GET)
   - Retrieves customer performance report
   - Includes total challans per customer
   - Total revenue per customer
   - Last purchase date
   - Sorted by customer name

4. **Product Report** (GET)
   - Retrieves product performance report
   - Includes sales count, quantity sold, and revenue
   - Current stock levels
   - Only includes confirmed sales

5. **Top Selling Products** (GET)
   - Retrieves top selling products sorted by quantity sold
   - Query parameter:
     - `limit`: Number of products to return (default: 10)
   - Includes total quantity sold, revenue, and sales count

### Execution

All report endpoints are read-only and can be executed independently after setting the `baseURL` and `token` environment variables. Use query parameters to filter reports as needed.
