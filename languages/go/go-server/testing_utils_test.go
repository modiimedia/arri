package arri_test

import (
	arri "arri/languages/go/go-server"
	"time"
)

type nestedObject struct {
	Id      string `json:"id"`
	Content string `json:"content"`
}

type objectWithEveryType struct {
	String        string          `json:"string"`
	Boolean       bool            `json:"boolean"`
	Timestamp     time.Time       `json:"timestamp"`
	Float32       float32         `json:"float32"`
	Float64       float64         `json:"float64"`
	Int8          int8            `json:"int8"`
	Uint8         uint8           `json:"uint8"`
	Int16         int16           `json:"int16"`
	Uint16        uint16          `json:"uint16"`
	Int32         int32           `json:"int32"`
	Uint32        uint32          `json:"uint32"`
	Int64         int64           `json:"int64"`
	Uint64        uint64          `json:"uint64"`
	Enum          string          `enum:"FOO,BAR,BAZ" json:"enum"`
	Object        nestedObject    `json:"object"`
	Array         []bool          `json:"array"`
	Record        map[string]bool `json:"record"`
	Discriminator discriminator   `json:"discriminator"`
	Any           any             `json:"any"`
}

type discriminator struct {
	arri.DiscriminatorKey `discriminatorKey:"typeName"`
	A                     *discriminatorA `discriminator:"A"`
	B                     *discriminatorB `discriminator:"B"`
	C                     *discriminatorC `discriminator:"C"`
}

type discriminatorA struct {
	Id string
}

type discriminatorB struct {
	Id   string
	Name string
}

type discriminatorC struct {
	Id   string
	Name string
	Date time.Time
}
