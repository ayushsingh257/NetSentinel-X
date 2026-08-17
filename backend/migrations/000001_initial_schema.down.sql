-- NetSentinel-X V2: Initial Schema Migration (Down)
-- Description: Reverts core tables and indexes.

DROP INDEX IF EXISTS idx_alerts_source_ip;
DROP INDEX IF EXISTS idx_alerts_severity;
DROP INDEX IF EXISTS idx_alerts_created_at;

DROP INDEX IF EXISTS idx_traffic_logs_status;
DROP INDEX IF EXISTS idx_traffic_logs_dest_ip;
DROP INDEX IF EXISTS idx_traffic_logs_source_ip;
DROP INDEX IF EXISTS idx_traffic_logs_created_at;

DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS traffic_logs;
