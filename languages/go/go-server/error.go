package main

type ArriServerError struct {
	Code int
	Message string
	Data *any
	Stack *[]string
}