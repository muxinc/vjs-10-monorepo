import { HtmlValidate } from 'html-validate';

export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    message: string;
    line?: number;
    column?: number;
    ruleId?: string;
  }>;
}

let htmlValidatorInstance: HtmlValidate | null = null;

/**
 * Gets or creates a singleton instance of HtmlValidate
 * configured for our use case (custom elements, HTML5, etc.)
 */
function getValidator(): HtmlValidate {
  if (!htmlValidatorInstance) {
    htmlValidatorInstance = new HtmlValidate({
      extends: ['html-validate:recommended'],
      rules: {
        // Allow custom elements (they must have a hyphen)
        'element-name': 'off',
        // Allow empty class attributes (from placeholder transformer)
        'no-redundant-attr': 'off',
        // Allow boolean attributes without values
        'attribute-boolean-style': 'off',
        // Allow buttons without type attribute (component templates)
        'no-implicit-button-type': 'off',
      },
    });
  }
  return htmlValidatorInstance;
}

/**
 * Validates an HTML string
 *
 * @param html - The HTML string to validate
 * @returns ValidationResult with valid flag and any errors
 */
export async function validateHTML(html: string): Promise<ValidationResult> {
  const validator = getValidator();
  const report = await validator.validateString(html);

  if (report.valid) {
    return { valid: true, errors: [] };
  }

  // html-validate returns messages directly on the report for string validation
  const errors: ValidationResult['errors'] = (report.results || []).flatMap(result =>
    (result.messages || []).map(msg => ({
      message: msg.message,
      line: msg.line,
      column: msg.column,
      ruleId: msg.ruleId,
    })),
  );

  return {
    valid: false,
    errors,
  };
}

/**
 * Validates that a custom element name follows HTML5 rules:
 * - Must contain a hyphen
 * - Must start with lowercase ASCII letter
 * - No uppercase letters allowed
 *
 * @param elementName - The custom element name to validate
 * @returns true if valid, false otherwise
 */
export function isValidCustomElementName(elementName: string): boolean {
  // Must contain a hyphen
  if (!elementName.includes('-')) {
    return false;
  }

  // Must start with lowercase ASCII letter
  if (!/^[a-z]/.test(elementName)) {
    return false;
  }

  // No uppercase letters allowed
  if (/[A-Z]/.test(elementName)) {
    return false;
  }

  // Basic validation passed
  return true;
}
