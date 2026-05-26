package services

var MaliciousIPs = map[string]bool{

	// TEST IOCS

	"185.220.101.1": true,
	"45.33.32.156":  true,
	"103.27.202.85": true,
	"91.134.183.18": true,
}

func IsMaliciousIP(ip string) bool {

	_, exists := MaliciousIPs[ip]

	return exists
}
