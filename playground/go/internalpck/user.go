package internalpck

import arri "github.com/modiimedia/arri/languages/go/go-server"

type User struct {
	Id       string            `json:"id"`
	Name     string            `json:"name"`
	IsAdmin  arri.Option[bool] `json:"isAdmin"`
	Settings Settings          `json:"settings"`
}

type Settings struct {
	PrefersDarkMode bool `json:"prefersDarkMode"`
}
