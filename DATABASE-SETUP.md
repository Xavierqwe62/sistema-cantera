# Canteras Renacimiento - Database Setup Guide

## Overview

This directory contains SQL files for the Canteras Renacimiento MySQL database schema and sample data.

## Files

- **schema.sql** - Complete database schema with 12 tables
- **seed.sql** - Sample/test data
- **SETUP-DATABASE.bat** - Automated setup script
- **FINALIZE-DATABASE.bat** - Final migration script
- **init-database.js** - Node.js setup script
- **init-database.py** - Python setup script

## Database Structure

### 12 Tables

1. **users** - Administrator and employee accounts
   - Columns: id, username, email, password_hash, full_name, role, is_active, last_login, created_at, updated_at
   - Role Types: admin, manager, employee

2. **categories** - Product categories
   - Columns: id, name, description, created_at
   - Examples: Revestimientos, Piezas Decorativas, Accesorios

3. **products** - Inventory items (cantera pieces)
   - Columns: id, sku, name, description, category_id, price_retail, price_wholesale, price_supplier, quantity_stock, minimum_stock, unit, image_url, is_active, created_at, updated_at
   - Contains 12 sample products with 3-tier pricing

4. **suppliers** - Vendor/Provider information
   - Columns: id, name, contact_name, phone, email, address, city, created_at
   - Contains 3 sample suppliers

5. **supplier_products** - Linking table (M:N relationship)
   - Columns: id, supplier_id, product_id, supplier_sku, supplier_price, lead_time, created_at
   - UNIQUE constraint on (supplier_id, product_id)

6. **clients** - Customers
   - Columns: id, name, contact_name, phone, email, address, city, state, postal_code, client_type, tax_id, is_active, created_at
   - Client Types: mayoreo (wholesale), menudeo (retail)

7. **employees** - Staff members and salespeople
   - Columns: id, first_name, last_name, email, phone, position, hire_date, is_active, created_at
   - Contains 5 sample employees

8. **sales** - Sales orders/transactions
   - Columns: id, sale_number, client_id, employee_id, sale_date, subtotal, discount_percent, discount_amount, shipping_cost, tax, total, shipping_method, shipping_address, delivery_date, status, notes, created_at, updated_at
   - Status Values: pending, completed, shipped, cancelled
   - Shipping Methods: pickup, local, regional, national
   - Contains 6 sample sales

9. **sale_items** - Individual line items in sales
   - Columns: id, sale_id, product_id, quantity, unit_price, line_total
   - ON DELETE CASCADE when sale is deleted
   - Contains 12 sample sale items

10. **inventory_movements** - Stock tracking and auditing
    - Columns: id, product_id, movement_type, quantity, reference_id, reference_type, notes, created_by, created_at
    - Movement Types: entrada (receipt), salida (dispatch), ajuste (adjustment), devolucion (return)
    - Contains 7 sample movements

11. **audit_log** - Change tracking and audit trail
    - Columns: id, user_id, module, action, entity_id, entity_type, old_values, new_values, ip_address, user_agent, created_at
    - Stores old_values and new_values as JSON
    - Contains 4 sample audit entries

12. **stock_alerts** - Low stock warnings
    - Columns: id, product_id, alert_type, threshold, is_active, created_at
    - Alert Types: low_stock, out_of_stock, overstock
    - Contains 5 sample alerts

## Quick Start

### Option 1: Automated Setup (Recommended)

```bash
cd C:\Users\Xavier\para proyectos web\proyecto
SETUP-DATABASE.bat
```

This will:
1. Create the backend/database directory
2. Generate schema.sql and seed.sql files

Then run:

```bash
FINALIZE-DATABASE.bat
```

This will move the files to the correct location.

### Option 2: Manual Setup

1. Create the database directory:
   ```bash
   mkdir backend\database
   ```

2. Copy the SQL files:
   ```bash
   copy schema.sql backend\database\schema.sql
   copy seed.sql backend\database\seed.sql
   ```

### Option 3: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your MySQL server
3. File → Open SQL Script → Select `backend/database/schema.sql`
4. Execute (⚡ button)
5. Repeat for `backend/database/seed.sql`

### Option 4: Command Line

```bash
cd backend/database

# Create database and tables
mysql -u root -p < schema.sql

# Insert sample data
mysql -u root -p < seed.sql
```

## Database Configuration

**Database Name:** `canterasrenacimiento`

**Charset:** UTF-8mb4 (supports full Unicode)

**Engine:** InnoDB (supports transactions and foreign keys)

**Collation:** utf8mb4_unicode_ci (case-insensitive)

## Sample Data

The seed.sql file includes:
- 1 admin user, 1 manager, 1 employee
- 4 product categories
- 12 products with pricing
- 3 suppliers
- 5 client accounts
- 6 sales orders
- 12 line items
- 7 inventory movements
- 4 audit log entries
- 5 stock alerts

## Features

### Data Integrity
- PRIMARY KEYs on all tables
- FOREIGN KEY constraints with ON DELETE CASCADE/RESTRICT
- UNIQUE constraints on SKU, usernames, emails
- NOT NULL constraints where required

### Performance
- Indexes on frequently searched columns (category, sku, email, client_id, employee_id, sale_date, status)
- Composite indexes for common queries

### Audit Trail
- created_at timestamp on all tables (auto-populated)
- updated_at timestamp on mutable tables (auto-updated)
- audit_log table for tracking changes
- JSON support for old_values/new_values

### Business Logic
- Three-tier pricing (retail, wholesale, supplier)
- Inventory tracking with stock alerts
- Sale status workflow
- Client type differentiation (mayoreo/menudeo)
- Shipping method tracking

## Next Steps

1. Import the SQL files into your MySQL server
2. Verify all 12 tables are created:
   ```sql
   SHOW TABLES FROM canterasrenacimiento;
   ```

3. Check record counts:
   ```sql
   SELECT 'users' as table_name, COUNT(*) as count FROM users
   UNION
   SELECT 'products', COUNT(*) FROM products
   UNION
   SELECT 'sales', COUNT(*) FROM sales;
   ```

4. Configure your backend application to connect to this database
5. Update database credentials in your connection strings

## Support

For issues or questions about the database schema, refer to:
- BACKEND_SETUP.md - Backend configuration guide
- README.md - Project overview
