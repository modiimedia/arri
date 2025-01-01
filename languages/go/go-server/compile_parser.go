package arri

import (
	"fmt"
	"go/parser"
	"go/token"
	"io/fs"
	"path/filepath"
	"slices"
	"strings"
)

// key = the package name
// value = the directory of the package
type PackageMap = map[string]string

func GetPackages(rootDir string) (PackageMap, error) {
	dirs := []string{}
	filepath.WalkDir(rootDir, func(path string, d fs.DirEntry, err error) error {
		if !d.Type().IsDir() {
			return nil
		}
		if d.Name() == "node_modules" ||
			// ignore any directory starting with "."
			(d.Name() != "." && strings.HasPrefix(d.Name(), ".")) {
			return filepath.SkipDir
		}
		if !slices.Contains(dirs, d.Name()) {
			dirs = append(dirs, d.Name())
		}
		fmt.Println("DIR_ENTRY", d.Name())
		return nil
	})
	result := map[string]string{}
	for _, dir := range dirs {
		err := GetPackagesFromDir(result, dir)
		if err != nil {
			return result, err
		}
	}
	return result, nil
}

func GetPackagesFromDir(packages PackageMap, dir string) error {
	fset := token.NewFileSet()
	result, err := parser.ParseDir(
		fset,
		dir,
		func(fi fs.FileInfo) bool {
			return !strings.HasSuffix(fi.Name(), "g.go")
		},
		parser.ImportsOnly,
	)
	if err != nil {
		fmt.Print(err.Error())
		return err
	}
	for k := range result {
		packages[k] = dir
	}
	return nil
}
