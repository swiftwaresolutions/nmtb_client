/**
 * Number Input Utility - Reusable functions for handling number input values
 * Used throughout the HIMS application for consistent number field behavior
 */

/**
 * Remove leading zeros from numeric string input
 * @param value - The string value to process
 * @returns The cleaned string with leading zeros removed (except single "0")
 * 
 * @example
 * removeLeadingZeros("01")    // Returns "1"
 * removeLeadingZeros("025")   // Returns "25"
 * removeLeadingZeros("0")     // Returns "0"
 * removeLeadingZeros("100")   // Returns "100"
 * removeLeadingZeros("")      // Returns ""
 */
export const removeLeadingZeros = (value: string): string => {
  if (value.startsWith('0') && value.length > 1) {
    return value.replace(/^0+/, '');
  }
  return value;
};

/**
 * Handle number input change event with default value restoration
 * Removes leading zeros and converts to number, fills empty with 0
 * @param inputValue - The input string value
 * @param defaultValue - The default value when empty (default: 0)
 * @returns The processed numeric value
 * 
 * @example
 * handleNumberChange("01", 0)      // Returns 1
 * handleNumberChange("", 0)        // Returns 0
 * handleNumberChange("100.50", 0)  // Returns 100.50
 */
export const handleNumberChange = (inputValue: string, defaultValue: number = 0): number => {
  let value = inputValue.trim();
  
  // Remove leading zeros
  value = removeLeadingZeros(value);
  
  // If empty, return default value
  if (value === '') {
    return defaultValue;
  }
  
  // Convert to number and ensure it's not negative
  const numValue = parseFloat(value);
  return isNaN(numValue) ? defaultValue : Math.max(0, numValue);
};

/**
 * Handle number input blur event - restore default if empty
 * @param inputValue - The input string value
 * @param defaultValue - The default value to set when empty (default: 0)
 * @returns The processed numeric value
 * 
 * @example
 * handleNumberBlur("", 0)    // Returns 0
 * handleNumberBlur("50", 0)  // Returns 50
 */
export const handleNumberBlur = (inputValue: string, defaultValue: number = 0): number => {
  if (inputValue.trim() === '') {
    return defaultValue;
  }
  return parseFloat(inputValue) || defaultValue;
};

/**
 * Format number for display - shows empty string if value equals default
 * @param value - The numeric value to format
 * @param defaultValue - The default value to compare (default: 0)
 * @returns Empty string if value equals default, otherwise the value
 * 
 * @example
 * formatNumberDisplay(0, 0)    // Returns ""
 * formatNumberDisplay(50, 0)   // Returns 50
 * formatNumberDisplay(0, 10)   // Returns 0
 */
export const formatNumberDisplay = (value: number, defaultValue: number = 0): string | number => {
  return value === defaultValue ? '' : value;
};
