V5.13 Zendrop homepage description fix

Root cause:
FindCard contained double-escaped whitespace regexes (\s inside regex literals), so cleanup did not behave as intended.
In addition, Zendrop importer text can concatenate Product Name / Package Contents / Design / Colors with no whitespace.

Fixes:
- Corrects FindCard regexes.
- Adds zendropHomepageSummary() that parses the raw Shopify/Zendrop description before normal product summary logic.
- Detects concatenated importer labels even without spaces.
- Removes only Product Name, never the rest of the description.
- Uses useful non-label prose first; otherwise creates a summary from Design / Colors / Material.
- Guarantees the homepage description block is visible.
- Checkout behavior from V5.12 is unchanged.
