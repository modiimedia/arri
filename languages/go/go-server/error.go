package arri

type ErrorResponse struct {
	Code    uint32
	Message string
	Data    Option[any]
	Stack   Option[[]string]
}

func (a ErrorResponse) Error() string {
	return a.Message
}
