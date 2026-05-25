package packetcapture

import (
	"fmt"
	"log"
	"time"
	"strings"

	"netsentinel-x-backend/config"
	"netsentinel-x-backend/services"
	"netsentinel-x-backend/utils"
	"netsentinel-x-backend/websocket"

	"github.com/google/gopacket"
	"github.com/google/gopacket/layers"
	"github.com/google/gopacket/pcap"
)

var recentPackets = make(map[string]bool)

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

	// SKIP VIRTUAL / LOOPBACK / HYPER-V
		if strings.Contains(description, "hyper-v") ||
			strings.Contains(description, "virtual") ||
			strings.Contains(description, "loopback") ||
			strings.Contains(description, "npcap") {

			continue
		}

	// REQUIRE REAL IP
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

			fmt.Printf(
				"SRC: %s -> DST: %s | PROTOCOL: %s\n",
				ip.SrcIP,
				ip.DstIP,
				ip.Protocol,
			)

			port := 0

			ignorePacket := false

			tcpLayer := packet.Layer(layers.LayerTypeTCP)

			if tcpLayer != nil {

				tcp, _ := tcpLayer.(*layers.TCP)

				port = int(tcp.DstPort)
			}

			udpLayer := packet.Layer(layers.LayerTypeUDP)

			if udpLayer != nil {

				udp, _ := udpLayer.(*layers.UDP)

				port = int(udp.DstPort)

				if port == 1900 {

					ignorePacket = true

				}
			}

				if ignorePacket {

					continue
				}

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
					"[%s] SRC: %s (%s) -> DST: %s | PROTOCOL: %s | PORT: %d",
					timestamp,
					ip.SrcIP,
					country,
					ip.DstIP,
					ip.Protocol,
					port,
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

				alertMessage, exists := services.SuspiciousPorts[port]

				if exists {

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