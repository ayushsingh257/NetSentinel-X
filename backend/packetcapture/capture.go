package packetcapture

import (
	"fmt"
	"log"

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
}