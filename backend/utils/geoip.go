package utils

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type GeoIPResponse struct {
	Country string `json:"country"`
	City    string `json:"city"`
	Query   string `json:"query"`
}

func GetGeoIP(ip string) (*GeoIPResponse, error) {

	url := fmt.Sprintf("http://ip-api.com/json/%s", ip)

	response, err := http.Get(url)

	if err != nil {
		return nil, err
	}

	defer response.Body.Close()

	var geo GeoIPResponse

	err = json.NewDecoder(response.Body).Decode(&geo)

	if err != nil {
		return nil, err
	}

	return &geo, nil
}