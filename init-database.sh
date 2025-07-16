#!/bin/bash

# Database initialization script for OASA project
# This script creates the products schema and inserts sample data

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | xargs)
fi

# Default database connection parameters
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-oasa}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}

echo "Initializing OASA database schema and data..."
echo "Database: $DB_NAME on $DB_HOST:$DB_PORT"

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "Error: psql command not found. Please install PostgreSQL client."
    exit 1
fi

# Test database connection
echo "Testing database connection..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT version();" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "Error: Cannot connect to database. Please check your connection parameters."
    exit 1
fi

echo "Database connection successful."

# Run the products schema and sample data
echo "Creating products schema and inserting sample data..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f database/products_schema.sql

if [ $? -eq 0 ]; then
    echo "Products schema and sample data created successfully!"
else
    echo "Error: Failed to create products schema and sample data."
    exit 1
fi

# Optional: Show table counts
echo ""
echo "Database statistics:"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
SELECT 
    'products' as table_name, COUNT(*) as records FROM products
UNION ALL
SELECT 
    'product_categories' as table_name, COUNT(*) as records FROM product_categories
UNION ALL
SELECT 
    'product_images' as table_name, COUNT(*) as records FROM product_images
UNION ALL
SELECT 
    'product_reviews' as table_name, COUNT(*) as records FROM product_reviews;
"

echo ""
echo "Database initialization complete!"
echo ""
echo "You can now start the backend server with: npm start"
echo "And the frontend server with: npm run dev (in the frontend directory)"
