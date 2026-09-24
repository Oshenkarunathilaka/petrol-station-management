-- Step 12: Fuel Stock Reconciliation
CREATE TABLE stock_reconciliations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tank_id UUID NOT NULL REFERENCES tanks(id) ON DELETE RESTRICT,
    reconciliation_date DATE NOT NULL,
    opening_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    closing_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    opening_stock NUMERIC(12, 2) NOT NULL CHECK (opening_stock >= 0),
    confirmed_deliveries NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (confirmed_deliveries >= 0),
    fuel_sold NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (fuel_sold >= 0),
    expected_closing_stock NUMERIC(12, 2) GENERATED ALWAYS AS (opening_stock + confirmed_deliveries - fuel_sold) STORED,
    physical_closing_stock NUMERIC(12, 2) NOT NULL CHECK (physical_closing_stock >= 0),
    variance NUMERIC(12, 2) GENERATED ALWAYS AS (physical_closing_stock - (opening_stock + confirmed_deliveries - fuel_sold)) STORED,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'FINALIZED')),
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- INDEXES
CREATE INDEX idx_stock_recon_tank ON stock_reconciliations(tank_id);
CREATE INDEX idx_stock_recon_date ON stock_reconciliations(reconciliation_date);

-- TRIGGER for updated_at
CREATE TRIGGER set_stock_recon_updated_at BEFORE UPDATE ON stock_reconciliations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
