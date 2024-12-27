package arri

type Encoder struct {
	Options EncodingOptions
}

func NewEncoder(options EncodingOptions) Encoder {
	return Encoder{Options: EncodingOptions{}}
}

func (e Encoder) EncodeJSON(input any) ([]byte, error) {
	return EncodeJSON(input, e.Options)
}
