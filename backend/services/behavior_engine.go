package services

import "time"

var PortScanTracker = make(map[string][]int)

var BruteForceTracker = make(map[string]int)

var BeaconTracker = make(map[string]time.Time)
