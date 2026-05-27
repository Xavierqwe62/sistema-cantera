const fs = require('fs');
const path = require('path');

const dbDir = 'C:\\Users\\Xavier\\para proyectos web\\proyecto\\cantera-system\\backend\\database';

// Create directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`✓ Directory created: ${dbDir}`);
} else {
  console.log(`✓ Directory exists: ${dbDir}`);
}

// Read from separate files if they exist, otherwise create inline
const schemaSqlPath = path.join(__dirname, 'schema_content.sql');
const seedSqlPath = path.join(__dirname, 'seed_content.sql');

// Write schema.sql - will be created inline for simplicity
const schemaContent = `-- Canteras Renacimiento DB Schema
CREATE DATABASE IF NOT EXISTS canterasrenacimiento;
USE canterasrenacimiento;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'manager', 'employee') DEFAULT 'employee',
  is_active BOOLEAN DEFAULT TRUE,
  last_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  category_id INT NOT NULL,
  price_retail DECIMAL(10, 2) NOT NULL,
  price_wholesale DECIMAL(10, 2) NOT NULL,
  price_supplier DECIMAL(10, 2) NOT NULL,
  quantity_stock INT DEFAULT 0,
  minimum_stock INT DEFAULT 10,
  unit VARCHAR(50) DEFAULT 'piezas',
  image_url VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  INDEX idx_category (category_id),
  INDEX idx_sku (sku),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  contact_name VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  address VARCHAR(255),
  city VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE supplier_products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  supplier_id INT NOT NULL,
  product_id INT NOT NULL,
  supplier_sku VARCHAR(50),
  supplier_price DECIMAL(10, 2),
  lead_time INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_supplier_product (supplier_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  client_type ENUM('mayoreo', 'menudeo') DEFAULT 'menudeo',
  tax_id VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sale_number VARCHAR(50) NOT NULL UNIQUE,
  client_id INT NOT NULL,
  employee_id INT NOT NULL,
  sale_date DATE NOT NULL,
  subtotal DECIMAL(10, 2) DEFAULT 0,
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) DEFAULT 0,
  shipping_method ENUM('pickup', 'local', 'regional', 'national') DEFAULT 'pickup',
  shipping_address VARCHAR(255),
  delivery_date DATE,
  status ENUM('pending', 'completed', 'shipped', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE sale_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sale_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  line_total DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE stock_alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  alert_type ENUM('low_stock', 'out_of_stock', 'overstock') NOT NULL,
  threshold INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_active_stock ON products(is_active, quantity_stock);
CREATE INDEX idx_sales_client_date ON sales(client_id, sale_date);
`;

fs.writeFileSync(path.join(dbDir, 'schema.sql'), schemaContent, 'utf-8');
console.log('✓ Created: schema.sql');

const seedContent = `USE canterasrenacimiento;

INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@canteras.mx', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVm', 'Admin Principal', 'admin'),
('manager1', 'manager@canteras.mx', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVm', 'Gerente de Ventas', 'manager'),
('empleado1', 'empleado@canteras.mx', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVm', 'Empleado Vendedor', 'employee');

INSERT INTO categories (name, description) VALUES
('Revestimientos', 'Piedras para revestimiento de fachadas'),
('Piezas Decorativas', 'Piezas talladas y decorativas'),
('Accesorios', 'Accesorios y complementos');

INSERT INTO products (sku, name, description, category_id, price_retail, price_wholesale, price_supplier, quantity_stock, minimum_stock, unit) VALUES
('REV-001', 'Cantera Beige', 'Revestimiento beige natural', 1, 450.00, 400.00, 300.00, 150, 20, 'piezas'),
('REV-002', 'Cantera Rosa', 'Revestimiento rosa oscuro', 1, 500.00, 450.00, 350.00, 100, 15, 'piezas'),
('DEC-001', 'Jarrón Tallado', 'Jarrón de cantera tallado', 2, 800.00, 700.00, 500.00, 30, 5, 'piezas'),
('ACC-001', 'Mortero Gris', 'Mortero para cantera', 3, 150.00, 130.00, 100.00, 200, 30, 'bolsas');

INSERT INTO suppliers (name, contact_name, phone, email, city) VALUES
('Canteras México SA', 'Carlos López', '5551234567', 'carlos@canterasmexico.mx', 'Guanajuato'),
('Distribuidora Piedra', 'María García', '5559876543', 'maria@piedras.mx', 'Querétaro');

INSERT INTO supplier_products (supplier_id, product_id, supplier_sku, supplier_price, lead_time) VALUES
(1, 1, 'SP-REV-001', 300.00, 7),
(1, 2, 'SP-REV-002', 350.00, 10);

INSERT INTO clients (name, contact_name, phone, email, client_type, city) VALUES
('Constructora ABC', 'Juan Pérez', '5555551234', 'juan@abc.mx', 'mayoreo', 'CDMX'),
('Casa Diseño', 'Roberto Martínez', '5555559999', 'robert@diseno.mx', 'menudeo', 'México');

INSERT INTO employees (first_name, last_name, email, phone, position, hire_date) VALUES
('Carlos', 'Vendedor', 'carlos@canteras.mx', '5551111111', 'Vendedor', '2024-01-15'),
('Ana', 'García', 'ana@canteras.mx', '5552222222', 'Gerente', '2023-06-01');

INSERT INTO sales (sale_number, client_id, employee_id, sale_date, subtotal, tax, total, status) VALUES
('VTA-001', 1, 1, '2024-01-20', 5000.00, 400.00, 5400.00, 'completed'),
('VTA-002', 2, 1, '2024-01-22', 2400.00, 192.00, 2592.00, 'completed');

INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, line_total) VALUES
(1, 1, 10, 400.00, 4000.00),
(1, 3, 10, 130.00, 1300.00),
(2, 2, 3, 450.00, 1350.00);

INSERT INTO inventory_movements (product_id, movement_type, quantity, reference_id, reference_type, created_by) VALUES
(1, 'entrada', 50, 1, 'purchase', 1),
(1, 'salida', 10, 1, 'sale', 1);

INSERT INTO audit_log (user_id, module, action, entity_id, entity_type) VALUES
(1, 'sales', 'create', 1, 'sale'),
(2, 'products', 'update', 1, 'product');

INSERT INTO stock_alerts (product_id, alert_type, threshold) VALUES
(1, 'low_stock', 20),
(2, 'low_stock', 15);
`;

fs.writeFileSync(path.join(dbDir, 'seed.sql'), seedContent, 'utf-8');
console.log('✓ Created: seed.sql');

console.log('\n✓ Database files created successfully!');
console.log(`  Location: ${dbDir}`);
