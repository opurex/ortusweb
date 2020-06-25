# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

The semantic of version number is 'Level.Version'. Level is for compatibility between sofwares and Version is the release number.

## [8.3] - 2020-06-25

### Added
- Show reference in payment mode list, add a warning when no *cash* is set.
- List and view individual tickets.
- Table header and footer follow the screen and are shown in grey to distinguish them better from lines.
- Back label is editable for payment modes.
- The label of a category can be used instead of it's reference when importing products from csv (consistent with export).
- The product list can show all products instead of only from a given category.
- More sorting fields for products (reference, buy price, sell prices, margin).
- Category, reference, current buy price and margin in sales details when available.
- Checkbox to fill empty cells with 0 when no data is available in Z ticket.

### Changed
- The default column shown for Z tickets are changed: dates, cash amounts, CS and payment totals
- Https is enabled by default on the login screen.

### Fixed
- Android ticket header and footer resource name.
- Filters are not reseted when requesting an other set of Z tickets.
- CS and cash error total are formatted.
- Price sell is rounded to 5 decimals in sales details instead of being approximative.
- Payment mode returns and values edition.


## [8.2] - 2020-06-15

### Fixed
- Composition form


## [8.1] - 2020-06-02

- Login and local caching
- Catalog management: categories, products, compositions, customers, tariff areas and discount profiles
- Sales: Z tickets, details, by product
- Configuration: restaurant map, cash registers, payment modes, currencies, users, permissions (roles), ticket header/footer/logo.
- Table exports in csv format, product import from csv.
