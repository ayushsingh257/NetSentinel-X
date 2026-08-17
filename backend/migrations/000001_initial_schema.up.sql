-- NetSentinel-X V2: Initial Schema Migration (Up)
-- Description: Creates core traffic_logs and alerts tables with B-Tree indexes for fast querying.

CREATE TABLE IF NOT EXISTS traffic_logs (
    id SERIAL PRIMARY KEY,
    source_ip VARCHAR(50) NOT NULL,
    destination_ip VARCHAR(50) NOT NULL,
    protocol VARCHAR(20) NOT NULL,
    port INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'captured',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    source_ip VARCHAR(50) NOT NULL,
    destination_ip VARCHAR(50) NOT NULL,
    protocol VARCHAR(20) NOT NULL,
    port INTEGER NOT NULL,
    alert_message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes for Real-Time Querying & Filtering
CREATE INDEX IF NOT EXISTS idx_traffic_logs_created_at ON traffic_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_traffic_logs_source_ip ON traffic_logs (source_ip);
CREATE INDEX IF NOT EXISTS idx_traffic_logs_dest_ip ON traffic_logs (destination_ip);
CREATE INDEX IF NOT EXISTS idx_traffic_logs_status ON traffic_logs (status);

CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts (severity);
CREATE INDEX IF NOT EXISTS idx_alerts_source_ip ON alerts (source_ip);
