package packetcapture

import (
	"fmt"
	"log"

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
		}
	}
}