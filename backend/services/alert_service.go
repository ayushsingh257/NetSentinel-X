package services

var SuspiciousPorts = map[int]string{
	21:   "FTP Port Access Detected",
	23:   "Telnet Access Detected",
	25:   "SMTP Traffic Detected",
	53:   "DNS Traffic Detected",
	80:   "HTTP Traffic Detected",
	123:  "NTP Traffic Detected",
	135:  "RPC Port Activity",
	137:  "NetBIOS Activity",
	138:  "NetBIOS Datagram Service",
	139:  "SMB NetBIOS Session",
	443:  "HTTPS Secure Traffic Detected",
	445:  "SMB Access Detected",
	1433: "MSSQL Database Access",
	3306: "MySQL Database Access",
	3389: "RDP Remote Desktop Access",
	5432: "PostgreSQL Database Traffic",
}
