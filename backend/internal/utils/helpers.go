package utils

// strPtr returns a pointer to the given string.
// Useful when a struct field is *string but you have a string literal.
func strPtr(s string) *string {
	return &s
}
