package main

import (
	"encoding/json"
	"fmt"
	"reflect"
	"time"
)

const (
	Get    = "GET"
	Post   = "POST"
	Put    = "PUT"
	Patch  = "PATCH"
	Delete = "DELETE"
)

func main() {
	timestamp := time.Now()
	fmt.Println("TYPE:", reflect.TypeOf(timestamp), "VALUE", reflect.ValueOf(timestamp), "KIND", reflect.ValueOf(timestamp).Type().Name())
	var msg = Message{Id: "1", Text: "Hello world!"}
	var result, err = ToTypeDef(msg, SnakeCase)
	if err != nil {
		fmt.Println(err)
		return
	}
	var jsonResult, _ = json.Marshal(result)
	fmt.Println(string(jsonResult))

	var shapeResult, shapeErr = ToTypeDef(Shape{Rectangle: &Rectangle{Width: 10, Height: 1501}}, SnakeCase)
	if shapeErr != nil {
		fmt.Println("SHAPE_ERROR")
		fmt.Println(shapeErr)
		return
	}
	var shapeJsonResult, shapeJsonError = json.Marshal(shapeResult)
	if shapeJsonError != nil {
		fmt.Println(shapeJsonError.Error())
		return
	}
	fmt.Println(string(shapeJsonResult))

	var toJsonResult, toJsonError = ToJson(msg)
	if toJsonError != nil {
		fmt.Println(toJsonError)
		return
	}
	fmt.Println("JSON_RESULT", toJsonResult)
	fmt.Println("JSON_RESULT", string(toJsonResult))
}
