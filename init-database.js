#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Target directory
const dbDir = path.join('C:\\Users\\Xavier\\para proyectos web\\proyecto\\backend\\database');

console.log('Creating database directory and files...\n');

// Create directory
try {
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log(`✓ Created directory: ${dbDir}`);
  } else {
    console.log(`✓ Directory already exists: ${dbDir}`);
  }
} catch (err) {
  console.error('✗ Failed to create directory:', err.message);
  process.exit(1);
}

// Schema SQL content - All 12 tables
const schemaSql = `-- ============================================================================
-- Canteras Renacimiento - Database Schema
-- Created: 2024
-- Purpose: Complete database schema for cantera sales and inventory management
-- ============================================================================

CREATE DATABASE IF NOT EXISTS canterasrenacimiento;
USE canterasrenacimiento;

-- ============================================================================
-- TABLE 1: users - Admin users
-- ============================================================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'manager', 'employee') NOT NULL DEFAULT 'employee',
  is_active BOOLEAN DEFAULT TRUE,
  last_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 2: categories - Product categories
-- ============================================================================
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 3: products - Inventory items
-- ============================================================================
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  category_id INT NOT NULL,
  price_retail DECIMAL(10, 2) NOT NULL,
  price_wholesale DECIMAL(10, 2) NOT NULL,
  price_supplier DECIMAL(10, 2) NOT NULL,
  quantity_stock INT NOT NULL DEFAULT 0,
  minimum_stock INT NOT NULL DEFAULT 10,
  unit VARCHAR(50) NOT NULL DEFAULT 'piezas',
  image_url VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  INDEX idx_category (category_id),
  INDEX idx_sku (sku),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 4: suppliers - Proveedores
-- ============================================================================
CREATE TABLE suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  contact_name VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  address VARCHAR(255),
  city VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 5: supplier_products - Linking table for suppliers and products
-- ============================================================================
CREATE TABLE supplier_products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  supplier_id INT NOT NULL,
  product_id INT NOT NULL,
  supplier_sku VARCHAR(50),
  supplier_price DECIMAL(10, 2),
  lead_time INT COMMENT 'Lead time in days',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_supplier_product (supplier_id, product_id),
  INDEX idx_supplier (supplier_id),
  INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 6: clients - Customers
-- ============================================================================
CREATE TABLE clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  contact_name VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  client_type ENUM('mayoreo', 'menudeo') NOT NULL DEFAULT 'menudeo',
  tax_id VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 7: employees - Staff/Vendedores
-- ============================================================================
CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20),
  position VARCHAR(100) NOT NULL,
  hire_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 8: sales - Ventas/Orders
-- ============================================================================
CREATE TABLE sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sale_number VARCHAR(50) NOT NULL UNIQUE,
  client_id INT NOT NULL,
  employee_id INT NOT NULL,
  sale_date DATE NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  shipping_method ENUM('pickup', 'local', 'regional', 'national') DEFAULT 'pickup',
  shipping_address VARCHAR(255),
  delivery_date DATE,
  status ENUM('pending', 'completed', 'shipped', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE RESTRICT,
  INDEX idx_client (client_id),
  INDEX idx_employee (employee_id),
  INDEX idx_sale_date (sale_date),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 9: sale_items - Individual items in each sale
-- ============================================================================
CREATE TABLE sale_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sale_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  line_total DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_sale (sale_id),
  INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 10: inventory_movements - Stock tracking
-- ============================================================================
CREATE TABLE inventory_movements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  movement_type ENUM('entrada', 'salida', 'ajuste', 'devolucion') NOT NULL,
  quantity INT NOT NULL,
  reference_id INT,
  reference_type VARCHAR(50),
  notes TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_product (product_id),
  INDEX idx_movement_type (movement_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 11: audit_log - Auditoría
-- ============================================================================
CREATE TABLE audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  module VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  entity_id INT,
  entity_type VARCHAR(100),
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_module (module),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 12: stock_alerts - Alertas de stock bajo
-- ============================================================================
CREATE TABLE stock_alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  alert_type ENUM('low_stock', 'out_of_stock', 'overstock') NOT NULL,
  threshold INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product (product_id),
  INDEX idx_alert_type (alert_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Indexes for better query performance
-- ============================================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_active_stock ON products(is_active, quantity_stock);
CREATE INDEX idx_sales_client_date ON sales(client_id, sale_date);
CREATE INDEX idx_sales_employee_date ON sales(employee_id, sale_date);
CREATE INDEX idx_clients_active ON clients(is_active);
`;

// Seed SQL content
const seedSql = `-- ============================================================================
-- Canteras Renacimiento - Sample Data (Seed)
-- Created: 2024
-- Purpose: Initial test data for development
-- ============================================================================

USE canterasrenacimiento;

-- ============================================================================
-- INSERT: Admin Users
-- ============================================================================
INSERT INTO users (username, email, password_hash, full_name, role, is_active) VALUES
('admin', 'admin@canteras.mx', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVm', 'Admin Principal', 'admin', TRUE),
('manager1', 'manager@canteras.mx', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVm', 'Gerente de Ventas', 'manager', TRUE),
('empleado1', 'empleado@canteras.mx', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVm', 'Empleado Vendedor', 'employee', TRUE);

-- ============================================================================
-- INSERT: Categories
-- ============================================================================
INSERT INTO categories (name, description) VALUES
('Revestimientos', 'Piedras para revestimiento de fachadas y muros'),
('Piezas Decorativas', 'Piezas talladas y decorativas personalizadas'),
('Accesorios y Complementos', 'Accesorios, morteros y productos complementarios'),
('Pisos y Pavimentos', 'Losetas y piedras para pisos interiores y exteriores');

-- ============================================================================
-- INSERT: Products
-- ============================================================================
INSERT INTO products (sku, name, description, category_id, price_retail, price_wholesale, price_supplier, quantity_stock, minimum_stock, unit, is_active) VALUES
('REV-001', 'Revestimiento Cantera Beige', 'Revestimiento beige natural, acabado rustico', 1, 450.00, 400.00, 300.00, 150, 20, 'piezas', TRUE),
('REV-002', 'Revestimiento Cantera Rosa', 'Revestimiento rosa oscuro, acabado pulido', 1, 500.00, 450.00, 350.00, 100, 15, 'piezas', TRUE),
('REV-003', 'Revestimiento Cantera Gris', 'Revestimiento gris claro, acabado lijado', 1, 475.00, 425.00, 325.00, 75, 15, 'piezas', TRUE),
('DEC-001', 'Jarrón Tallado', 'Jarrón de cantera tallado a mano, 40cm', 2, 800.00, 700.00, 500.00, 30, 5, 'piezas', TRUE),
('DEC-002', 'Columna Clásica', 'Columna de cantera estilo clásico, 2m altura', 2, 1500.00, 1300.00, 900.00, 10, 2, 'piezas', TRUE),
('DEC-003', 'Fuente Decorativa', 'Fuente de cantera para jardín, tallada', 2, 2500.00, 2200.00, 1600.00, 5, 1, 'piezas', TRUE),
('ACC-001', 'Mortero de Junta Gris', 'Mortero especial para cantera, resistente', 3, 150.00, 130.00, 100.00, 200, 30, 'bolsas', TRUE),
('ACC-002', 'Mortero de Junta Blanco', 'Mortero blanco para acabados refinados', 3, 160.00, 140.00, 110.00, 150, 20, 'bolsas', TRUE),
('ACC-003', 'Sellador Transparente', 'Sellador para proteger cantera de humedad', 3, 120.00, 100.00, 75.00, 100, 15, 'botes', TRUE),
('PIS-001', 'Loseta Cantera 30x30', 'Loseta cuadrada 30x30cm para pisos', 4, 200.00, 180.00, 130.00, 500, 50, 'piezas', TRUE),
('PIS-002', 'Loseta Cantera 40x40', 'Loseta cuadrada 40x40cm para pisos', 4, 280.00, 250.00, 180.00, 300, 30, 'piezas', TRUE),
('PIS-003', 'Loseta Cantera 50x50', 'Loseta cuadrada 50x50cm para pisos', 4, 350.00, 310.00, 220.00, 200, 20, 'piezas', TRUE);

-- ============================================================================
-- INSERT: Suppliers
-- ============================================================================
INSERT INTO suppliers (name, contact_name, phone, email, address, city) VALUES
('Canteras México SA', 'Carlos López', '5551234567', 'carlos@canterasmexico.mx', 'Calle Principal 123', 'Guanajuato'),
('Distribuidora de Piedra Natural', 'María García', '5559876543', 'maria@piedrasdistribuidora.mx', 'Av. Industrial 456', 'Querétaro'),
('Proveedora de Materiales', 'Juan Martínez', '5552228899', 'juan@provedoramateriales.mx', 'Boulevard Central 789', 'San Luis Potosí');

-- ============================================================================
-- INSERT: Supplier Products
-- ============================================================================
INSERT INTO supplier_products (supplier_id, product_id, supplier_sku, supplier_price, lead_time) VALUES
(1, 1, 'SP-REV-001-A', 300.00, 7),
(1, 2, 'SP-REV-002-B', 350.00, 10),
(1, 3, 'SP-REV-003-C', 325.00, 10),
(2, 4, 'SP-DEC-001-D', 500.00, 14),
(2, 5, 'SP-DEC-002-E', 900.00, 21),
(3, 7, 'SP-ACC-001-F', 100.00, 3),
(3, 8, 'SP-ACC-002-G', 110.00, 3);

-- ============================================================================
-- INSERT: Clients
-- ============================================================================
INSERT INTO clients (name, contact_name, phone, email, address, city, state, postal_code, client_type, tax_id, is_active) VALUES
('Constructora ABC SA', 'Juan Pérez López', '5555551234', 'juan@constructorabc.mx', 'Calle Construcción 100', 'CDMX', 'CDMX', '06600', 'mayoreo', 'ABC123456789', TRUE),
('Casa de Diseño Interior', 'Roberto Martínez García', '5555559999', 'robert@casadiseno.mx', 'Av. Decoración 200', 'Monterrey', 'NL', '64000', 'menudeo', 'RMG123456789', TRUE),
('Tienda de Materiales', 'Patricia Rodríguez', '5551119999', 'patricia@tiendamateriales.mx', 'Calle Principal 50', 'Guadalajara', 'JL', '44100', 'mayoreo', 'PTR123456789', TRUE),
('Empresa de Remodelaciones', 'Fernando López', '5556668888', 'fernando@remodelaciones.mx', 'Boulevard Reforma 300', 'CDMX', 'CDMX', '06500', 'mayoreo', 'FER123456789', TRUE),
('Cliente Minorista Premium', 'Silvia Morales', '5557779999', 'silvia@premium.mx', 'Calle Elegancia 1', 'Cancún', 'QR', '77500', 'menudeo', 'SMO123456789', TRUE);

-- ============================================================================
-- INSERT: Employees
-- ============================================================================
INSERT INTO employees (first_name, last_name, email, phone, position, hire_date, is_active) VALUES
('Carlos', 'Vendedor García', 'carlos.vendedor@canteras.mx', '5551111111', 'Vendedor', '2024-01-15', TRUE),
('Ana', 'García Morales', 'ana.garcia@canteras.mx', '5552222222', 'Gerente de Ventas', '2023-06-01', TRUE),
('Roberto', 'Almacenista López', 'roberto.almacen@canteras.mx', '5553333333', 'Almacenista', '2024-02-01', TRUE),
('María', 'Contadora Pérez', 'maria.contadora@canteras.mx', '5554444444', 'Contador', '2023-09-15', TRUE),
('Diego', 'Vendedor Región', 'diego.vendedor@canteras.mx', '5555555555', 'Vendedor Regional', '2024-03-10', TRUE);

-- ============================================================================
-- INSERT: Sales
-- ============================================================================
INSERT INTO sales (sale_number, client_id, employee_id, sale_date, subtotal, discount_percent, discount_amount, shipping_cost, tax, total, shipping_method, shipping_address, status) VALUES
('VTA-2024-001', 1, 1, '2024-01-20', 5000.00, 5, 250.00, 500.00, 380.00, 5630.00, 'regional', 'Calle Construcción 100, CDMX', 'completed'),
('VTA-2024-002', 2, 1, '2024-01-22', 2400.00, 0, 0.00, 200.00, 208.00, 2808.00, 'pickup', 'Av. Decoración 200, Monterrey', 'completed'),
('VTA-2024-003', 3, 2, '2024-01-25', 8000.00, 10, 800.00, 1000.00, 570.00, 8770.00, 'national', 'Calle Principal 50, Guadalajara', 'shipped'),
('VTA-2024-004', 1, 2, '2024-02-05', 3500.00, 0, 0.00, 400.00, 312.00, 4212.00, 'local', 'Calle Construcción 100, CDMX', 'pending'),
('VTA-2024-005', 4, 1, '2024-02-10', 6000.00, 8, 480.00, 750.00, 418.44, 6688.44, 'national', 'Boulevard Reforma 300, CDMX', 'completed'),
('VTA-2024-006', 5, 2, '2024-02-15', 1200.00, 0, 0.00, 150.00, 108.00, 1458.00, 'local', 'Calle Elegancia 1, Cancún', 'pending');

-- ============================================================================
-- INSERT: Sale Items
-- ============================================================================
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, line_total) VALUES
(1, 1, 10, 400.00, 4000.00),
(1, 7, 10, 130.00, 1300.00),
(1, 10, 5, 180.00, 900.00),
(2, 4, 3, 700.00, 2100.00),
(3, 2, 15, 450.00, 6750.00),
(3, 8, 10, 140.00, 1400.00),
(4, 1, 8, 400.00, 3200.00),
(4, 9, 3, 100.00, 300.00),
(5, 3, 12, 450.00, 5400.00),
(5, 7, 5, 130.00, 650.00),
(6, 1, 2, 400.00, 800.00),
(6, 9, 4, 100.00, 400.00);

-- ============================================================================
-- INSERT: Inventory Movements
-- ============================================================================
INSERT INTO inventory_movements (product_id, movement_type, quantity, reference_id, reference_type, notes, created_by) VALUES
(1, 'entrada', 50, 1, 'supplier_order', 'Compra a Canteras México SA', 1),
(2, 'entrada', 30, 1, 'supplier_order', 'Compra a Canteras México SA', 1),
(7, 'entrada', 100, 2, 'supplier_order', 'Compra a Proveedora de Materiales', 1),
(1, 'salida', 10, 1, 'sale', 'Venta VTA-2024-001', 1),
(1, 'salida', 2, 6, 'sale', 'Venta VTA-2024-006', 1),
(4, 'salida', 3, 2, 'sale', 'Venta VTA-2024-002', 1),
(1, 'ajuste', 5, NULL, 'manual_adjustment', 'Ajuste de inventario - físico', 1);

-- ============================================================================
-- INSERT: Audit Log
-- ============================================================================
INSERT INTO audit_log (user_id, module, action, entity_id, entity_type, old_values, new_values) VALUES
(1, 'sales', 'create', 1, 'sale', NULL, '{"sale_number":"VTA-2024-001","client_id":1,"total":5630.00}'),
(2, 'products', 'update', 1, 'product', '{"quantity_stock":150}', '{"quantity_stock":140}'),
(1, 'inventory', 'create', 1, 'movement', NULL, '{"product_id":1,"movement_type":"salida","quantity":10}'),
(2, 'sales', 'update', 3, 'sale', '{"status":"pending"}', '{"status":"shipped"}');

-- ============================================================================
-- INSERT: Stock Alerts
-- ============================================================================
INSERT INTO stock_alerts (product_id, alert_type, threshold, is_active) VALUES
(1, 'low_stock', 20, TRUE),
(2, 'low_stock', 15, TRUE),
(4, 'low_stock', 5, TRUE),
(5, 'low_stock', 2, TRUE),
(7, 'low_stock', 30, TRUE);
`;

// Write schema.sql
try {
  fs.writeFileSync(path.join(dbDir, 'schema.sql'), schemaSql, 'utf-8');
  console.log('✓ Created: schema.sql (12 tables)');
} catch (err) {
  console.error('✗ Failed to write schema.sql:', err.message);
  process.exit(1);
}

// Write seed.sql
try {
  fs.writeFileSync(path.join(dbDir, 'seed.sql'), seedSql, 'utf-8');
  console.log('✓ Created: seed.sql (sample data)');
} catch (err) {
  console.error('✗ Failed to write seed.sql:', err.message);
  process.exit(1);
}

console.log('\n✓ Database files created successfully!');
console.log(\`  Location: \${dbDir}\`);
console.log('\nFiles:');
console.log('  - schema.sql  (12 tables with proper structure)');
console.log('  - seed.sql    (sample data for testing)');
`;
