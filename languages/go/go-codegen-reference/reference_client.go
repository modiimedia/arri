package reference_client

import (
	"encoding/json"
	"fmt"
	"time"
)

type Book struct {
	Id string
	Name string
	CreatedAt time.Time
	UpdatedAt time.Time
}

func NewBook() Book {
	return Book{
		Id: "",
		Name: "",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
}

func FromJsonString(input string) Book {
	parsed, err := json.Unmarshal()
	if err != nil {
		fmt.Println(err)
		return NewBook()
	}
	
}

func (book Book) ToJsonString() string {
	json := "{"
	json += `"id":`
	json += `"` + book.Id + `"`
	json += `,"name":`
	json += `"` + book.Name + `"`
	json += `,"createdAt":`
	json += `"` + book.CreatedAt.Format("YYYY-MM-DDTHH:mm:ss.sssZ") + `"`
	json += `,"updatedAt":`
	json += `"` + book.UpdatedAt.Format("YYYY-MM-DDTHH:mm:ss.sssZ") + `"`
	json += "}"
	return json
}

func main() {
}