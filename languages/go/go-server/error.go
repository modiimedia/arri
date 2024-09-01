package main

type ErrorResponse struct {
	Code    uint32
	Message string
	Data    *any
	Stack   *[]string
}

func (a ErrorResponse) Error() string {
	return a.Message
}
