package arri

import "strings"

type Headers map[string]string

func (h Headers) Get(key string) string {
	val, ok := h[strings.ToLower(key)]
	if !ok {
		return ""
	}
	return val
}

func (h Headers) Set(key, val string) {
	h[strings.ToLower(key)] = val
}

func (h Headers) Del(key string) {
	delete(h, strings.ToLower(key))
}
