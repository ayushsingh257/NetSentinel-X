package packetcapture

import (
	"fmt"
	"log"


	"netsentinel-x-backend/config"
	"netsentinel-x-backend/websocket"
	"netsentinel-x-backend/services"

	"github.com/google/gopacket"
	"github.com/google/gopacket/layers"
	"github.com/google/gopacket/pcap"
)

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

	selectedDevice := `\Device\NPF_{C02222A2-3939-43FC-B381-721C0EC551B3}`

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

	tcpLayer := packet.Layer(layers.LayerTypeTCP)

	if tcpLayer != nil {
		tcp, _ := tcpLayer.(*layers.TCP)
		port = int(tcp.DstPort)
	}

	udpLayer := packet.Layer(layers.LayerTypeUDP)

	if udpLayer != nil {
		udp, _ := udpLayer.(*layers.UDP)
		port = int(udp.DstPort)
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

	message := fmt.Sprintf(
		"SRC: %s -> DST: %s | PROTOCOL: %s | PORT: %d",
		ip.SrcIP,
		ip.DstIP,
		ip.Protocol,
		port,
	)

	websocket.BroadcastTraffic(message)

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

	// fmt.Println("Traffic log stored in database")
	// fmt.Println("PORT:", strconv.Itoa(port))
	// fmt.Println("--------------------------------")
}
		}
	}
}