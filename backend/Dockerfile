FROM golang:1.26

WORKDIR /app

RUN apt-get update && apt-get install -y libpcap-dev

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN go build -o netsentinel .

EXPOSE 8080

CMD ["./netsentinel"]