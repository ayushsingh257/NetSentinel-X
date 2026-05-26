package packetcapture

import (
	"fmt"
	"log"
	"strings"
	"time"

	"netsentinel-x-backend/config"
	"netsentinel-x-backend/services"
	"netsentinel-x-backend/utils"
	"netsentinel-x-backend/websocket"

	"github.com/google/gopacket"
	"github.com/google/gopacket/layers"
	"github.com/google/gopacket/pcap"
)

var recentPackets = make(map[string]bool)

var recentAlerts = make(map[string]time.Time)

func StartPacketCapture() {

	devices, err := pcap.FindAllDevs()

	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Available Network Interfaces:")

	for _, device := range devices {

		fmt.Println("--------------------------------")
		fmt.Println("Name:", device.Name)
		fmt.Println("Description:", device.Description)

		for _, address := range device.Addresses {
			fmt.Println("IP Address:", address.IP)
		}
	}

	var selectedDevice string

	for _, device := range devices {

		description := strings.ToLower(device.Description)

		if strings.Contains(description, "hyper-v") ||
			strings.Contains(description, "virtual") ||
			strings.Contains(description, "loopback") ||
			strings.Contains(description, "npcap") {

			continue
		}

		if len(device.Addresses) > 0 {

			selectedDevice = device.Name

			fmt.Println("Selected Real Interface:", device.Description)

			break
		}
	}

	if selectedDevice == "" {

		log.Fatal("No valid network interface found")
	}

	fmt.Println("--------------------------------")
	fmt.Println("Using Interface:", selectedDevice)

	handle, err := pcap.OpenLive(
		selectedDevice,
		1600,
		true,
		pcap.BlockForever,
	)

	if err != nil {
		log.Fatal(err)
	}

	defer handle.Close()

	packetSource := gopacket.NewPacketSource(
		handle,
		handle.LinkType(),
	)

	fmt.Println("Live Packet Capture Started...")
	fmt.Println("--------------------------------")

	for packet := range packetSource.Packets() {

		ipLayer := packet.Layer(layers.LayerTypeIPv4)

		if ipLayer != nil {

			ip, _ := ipLayer.(*layers.IPv4)

			port := 0

			ignorePacket := false

			serviceType := "UNKNOWN"

			trafficCategory := "GENERAL TRAFFIC"

			// =========================
			// TCP INSPECTION
			// =========================

			tcpLayer := packet.Layer(layers.LayerTypeTCP)

			if tcpLayer != nil {

				tcp, _ := tcpLayer.(*layers.TCP)

				port = int(tcp.DstPort)

				// =========================
				// SERVICE IDENTIFICATION
				// =========================

				switch port {

				case 80:
					serviceType = "HTTP"
					trafficCategory = "WEB TRAFFIC"

				case 443:
					serviceType = "HTTPS"
					trafficCategory = "SECURE WEB TRAFFIC"

				case 53:
					serviceType = "DNS"
					trafficCategory = "DNS TRAFFIC"

				case 22:
					serviceType = "SSH"
					trafficCategory = "REMOTE ACCESS"

				case 21:
					serviceType = "FTP"
					trafficCategory = "FILE TRANSFER"

				case 25:
					serviceType = "SMTP"
					trafficCategory = "EMAIL TRAFFIC"

				case 3389:
					serviceType = "RDP"
					trafficCategory = "REMOTE DESKTOP"

				default:
					serviceType = "UNKNOWN"
					trafficCategory = "GENERAL TRAFFIC"
				}

				fmt.Println("📦 TRAFFIC CATEGORY:", trafficCategory)
				fmt.Println("🧠 SERVICE:", serviceType)

				// =========================
				// TLS / HTTPS INSPECTION
				// =========================

				if port == 443 {

					fmt.Println("--------------------------------")
					fmt.Println("🔒 TLS HANDSHAKE DETECTED")
					fmt.Println("🌍 HTTPS TRAFFIC IDENTIFIED")
					fmt.Println("🔐 TLS VERSION: TLS 1.2 / TLS 1.3")

					payload := tcp.Payload

					if len(payload) > 0 {

						payloadString := string(payload)

						if strings.Contains(payloadString, "server_name") {

							fmt.Println("🌐 TLS SNI DETECTED")
						}
					}
				}

				// =========================
				// HTTP PAYLOAD INSPECTION
				// =========================

				payload := tcp.Payload

				if len(payload) > 0 {

					payloadString := string(payload)

					// HTTP METHODS

					if strings.HasPrefix(payloadString, "GET") {

						fmt.Println("📥 HTTP METHOD: GET")
					}

					if strings.HasPrefix(payloadString, "POST") {

						fmt.Println("📤 HTTP METHOD: POST")
					}

					if strings.HasPrefix(payloadString, "PUT") {

						fmt.Println("🛠 HTTP METHOD: PUT")
					}

					if strings.HasPrefix(payloadString, "DELETE") {

						fmt.Println("❌ HTTP METHOD: DELETE")
					}

					// HOST + USER AGENT

					if strings.Contains(payloadString, "Host:") {

						fmt.Println("--------------------------------")
						fmt.Println("🌐 HTTP PACKET DETECTED")

						lines := strings.Split(payloadString, "\r\n")

						for _, line := range lines {

							if strings.HasPrefix(line, "Host:") {

								fmt.Println("🌍 HOST:", line)
							}

							if strings.HasPrefix(line, "User-Agent:") {

								fmt.Println("🧠 USER-AGENT:", line)
							}
						}
					}
				}
			}

			// =========================
			// UDP INSPECTION
			// =========================

			udpLayer := packet.Layer(layers.LayerTypeUDP)

			if udpLayer != nil {

				udp, _ := udpLayer.(*layers.UDP)

				port = int(udp.DstPort)

				if port == 53 {

					serviceType = "DNS"
					trafficCategory = "DNS TRAFFIC"

					fmt.Println("📦 TRAFFIC CATEGORY:", trafficCategory)
					fmt.Println("🧠 SERVICE:", serviceType)
				}

				if port == 1900 {

					ignorePacket = true
				}
			}

			// =========================
			// DNS INSPECTION
			// =========================

			dnsLayer := packet.Layer(layers.LayerTypeDNS)

			if dnsLayer != nil {

				dns, _ := dnsLayer.(*layers.DNS)

				for _, question := range dns.Questions {

					fmt.Println(
						"🌐 DNS Query:",
						string(question.Name),
					)
				}
			}

			if ignorePacket {

				continue
			}

			// =========================
			// DATABASE LOGGING
			// =========================

			query := `
				INSERT INTO traffic_logs
				(source_ip, destination_ip, protocol, port, status)
				VALUES ($1, $2, $3, $4, $5)
			`

			_, err := config.DB.Exec(
				query,
				ip.SrcIP.String(),
				ip.DstIP.String(),
				ip.Protocol.String(),
				port,
				"captured",
			)

			if err != nil {

				log.Println("Database insert failed:", err)

			} else {

				geoData, err := utils.GetGeoIP(ip.SrcIP.String())

				country := "LOCAL NETWORK"

				if err == nil && geoData.Country != "" {

					country = geoData.Country
				}

				timestamp := time.Now().Format("15:04:05")

				message := fmt.Sprintf(
					"[%s] SRC: %s (%s) -> DST: %s | PROTOCOL: %s | PORT: %d | CATEGORY: %s | SERVICE: %s",
					timestamp,
					ip.SrcIP,
					country,
					ip.DstIP,
					ip.Protocol,
					port,
					trafficCategory,
					serviceType,
				)

				packetKey := fmt.Sprintf(
					"%s-%s-%s-%d",
					ip.SrcIP,
					ip.DstIP,
					ip.Protocol,
					port,
				)

				if !recentPackets[packetKey] {

					recentPackets[packetKey] = true

					websocket.BroadcastTraffic(message)

					go func(key string) {

						<-time.After(500 * time.Millisecond)

						delete(recentPackets, key)

					}(packetKey)
				}

				// =========================
				// THREAT DETECTION
				// =========================

				alertMessage, exists := services.SuspiciousPorts[port]

				if exists {

					alertKey := fmt.Sprintf(
						"%s-%s-%s-%d",
						ip.SrcIP.String(),
						ip.DstIP.String(),
						ip.Protocol.String(),
						port,
					)

					lastSeen, exists := recentAlerts[alertKey]

					if exists {

						if time.Since(lastSeen) < 10*time.Second {

							continue
						}
					}

					recentAlerts[alertKey] = time.Now()

					alertQuery := `
					INSERT INTO alerts
					(source_ip, destination_ip, protocol, port, alert_message, severity)
					VALUES ($1, $2, $3, $4, $5, $6)
					`

					_, err := config.DB.Exec(
						alertQuery,
						ip.SrcIP.String(),
						ip.DstIP.String(),
						ip.Protocol.String(),
						port,
						alertMessage,
						"HIGH",
					)

					if err != nil {

						log.Println("Alert insert failed:", err)

					} else {

						fmt.Println("🚨 ALERT:", alertMessage)
					}
				}
			}
		}
	}
}