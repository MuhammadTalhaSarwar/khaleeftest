package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
	"sync"
	"unicode"
)

func searchFileForWord(filePath string, word string) []string {
	file, err := os.Open(filePath)
	if err != nil {
		panic(err)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	scanner.Split(bufio.ScanLines)

	var matches []string
	for scanner.Scan() {
		line := scanner.Text()
		words := strings.Fields(line)
		for i, w := range words {
			w = strings.TrimRightFunc(w, func(r rune) bool {
				return !unicode.IsLetter(r)
			})
			if strings.EqualFold(strings.ToLower(w), strings.ToLower(word)) {
				start := max(0, i-3)
				end := min(len(words), i+4)
				context := strings.Join(words[start:end], " ")
				matches = append(matches, context)
				break
			}
		}
	}

	return matches
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func searchWorker(filePath string, word string, results chan<- []string, wg *sync.WaitGroup) {
	defer wg.Done()

	matches := searchFileForWord(filePath, word)

	results <- matches
}

func main() {
	scanner := bufio.NewScanner(os.Stdin)

	attempts := 0
	var filename string

	for {
		if attempts > 3 {
			fmt.Println("Too many invalid attempts. Exiting program.")
			os.Exit(1)
		}

		fmt.Print("Enter the filename to search: ")
		scanner.Scan()
		filename = scanner.Text()
		filename = "./uploads/" + filename

		if _, err := os.Stat(filename); err != nil {
			fmt.Println("File does not exist. Please try again.")
			attempts++
			continue
		}

		break
	}

	for {
		fmt.Print("Enter a search term (or 'letsquit' to quit): ")
		scanner.Scan()
		answer := scanner.Text()

		if answer == "letsquit" {
			break
		}

		results := make(chan []string)
		var wg sync.WaitGroup
		wg.Add(1)

		go searchWorker(filename, answer, results, &wg)

		go func() {
			wg.Wait()
			close(results)
		}()

		for matches := range results {
			if len(matches) == 0 {
				fmt.Printf("No matches found for '%s'\n", answer)
			} else {
				fmt.Printf("Found %d matches for '%s':\n", len(matches), answer)
				for _, match := range matches {
					fmt.Println(match)
				}
			}
		}
	}
}
