package internalpck

import arri "github.com/modiimedia/arri/languages/go/go-server"

type User struct {
	Id       string
	Name     string
	IsAdmin  arri.Option[bool]
	Settings Settings
}

type Settings struct {
	PrefersDarkMode bool
}
