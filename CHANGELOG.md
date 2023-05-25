# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

The semantic of version number is 'Level.Version'. Level is for compatibility between sofwares and Version is the release number.

## [8.19] - 2023-05-25

### Added

### Changed
- Record linking is case insensitive with a warning when importing from csv (affects categories and customers)

### Fixed
- Creating a payment mode with self-referencing return
- Scale type reading from csv import, default scale value
- Restoring saved default column visibility for z-tickets


## [8.18] - 2023-03-27

### Added
- Customer in sales details
- Table pagination and search, page length in preferences
- Choices for Atkinson Hyperlegible font or system font
- Filter active/inactive/all customers in list

### Changed
- Default columns option format (retro-compatible)
- storage_get result format for multiple read

### Fixed
- Importing products and categories with special characters
- Customer's note
- Showing user's default columns in sales by products
- Show history and balance after creating a new customer
- Clear session font on logout


## [8.17]- 2022-10-20

### Added
- Consolidated option in customer's history
- List tickets in customer's history
- Configurable accounting export of z tickets


## [8.16] - 2022-08-22

### Added
- Import customers from csv file
- Discount profile list is exportable and filterable
- Products not sold are displayed with their label in italic in catalog picker (compositions, tariff areas)
- Show version number on home screen

### Changed
- Refactored a lot of form fields for consistency
- Refactored importing records for maintenability

### Fixed
- Discount lines and discount are shown on tickets
- Seconds are displayed for datetimes (mostly ticket and zticket dates)
- Export format for some numbers for ztickets


## [8.15] - 2022-04-14

### Added
- Show allowed roles in payment mode list

### Fixed
- NaN with decimal quantities in sales by product
- Sales by category without custom products


## [8.14] - 2021-12-13

### Added
- Cs + taxes, over perceived in z-tickets
- Month and week number in sales details
- Taxes details in sales by product
- Total footer for sales by product and sales by category

### Changed
- Sales by category by tax is merged into sales by category
- Files for packaging are read dynamically


## [8.13] - 2021-09-15

### Added
- Add icons to table filter button
- Add logic for icons to table filter buttons
- Add Sales (with distinct VAT) by category
- Add custom products in salesByCategory
- Add payment method column on salesdetails.js

### Fixed
- Format number on CSV export
- Fix some missnamed column titles

## [8.12] - 2021-06-28

### Added
- Select fields to show for customers, export to csv.
- List and sort sub-category as a tree or as a flat list like before.

### Fixed
- Customer's expire date field
- Product form for a newly created product
- Silent error when computing the price of reference of a new product


## [8.11] - 2021-06-01

### Added
- Style for table column buttons
- Options are stored locally
- Save columns displayed by default for tables
- Scale type "time"

### Fixed
- Permissions for payment modes
- Alignment of checkbox in navbars


## [8.10] - 2021-03-04

### Added
- Custom products in sales by product.
- Sell with VAT in sales by product.
- Total in the footer of the ticket table.

### Fixed
- Use the real sell price from the ticket in sales by product instead of the latest one
- Empty values instead of "no changes" in select inputs from customer and category forms


## [8.9] - 2021-02-04

### Added
- Option to use OpenDyslexic font, user options.
- Import categories from csv.
- Select fields to show for tariff areas.
- Import/export tariff area prices from/to csv.
- Select fields to show for currencies, export to csv.
- Select fields to show for payment modes.
- Display the scaled price on product form.

### Changed
- Logout is now located under the user menu.
- Sync status is shown on top and centered on home page.
- Rates are shown and edited in percent instead of rate.
- Reorganized scale-related fields in product form, with reference price

### Fixed
- Links on home page.
- Z ticket payment amounts with multiple currencies (only shown in main currency).
- Role list.
- Payment modes can be disabled/reenabled, payment mode values can be deleted.


## [8.8] - 2020-12-14

### Added
- Tax edition/creation.
- Tax rate, ticket number, payment mode, ticket discount in the customer's history.

### Changed
- Wording: Edit -> Modifier, Session has expired + note about current task.

### Fixed
- Product scaleType is updated correctly after edition.
- Vertical alignment for navigation buttons in lists.
- Url to framagit.


## [8.7] - 2020-10-21

### Added
- Customer's balances in Z tickets.
- Customer in the ticket list.
- Duplicate a product.

### Changed
- The tax rate must be explicitely set when creating a new product.


## [8.6] - 2020-09-18

### Added
- Prices in the customers' history.
- Notice for legal informations to put in ticket header or footer.

### Fixed
- Quantity not being localized in sales by products


## [8.5] - 2020-07-21

### Added
- Select fields to show for the list of categories, export to spreadsheet.
- List tickets from all cash registers.
- Option to include unused payment modes, taxes and/or categories in the list of Z tickets.
- Button to show all/hide all/toggle fields of tables.
- Generate label sheets, ported from previous versions of the back-office.


## [8.4] - 2020-07-09

### Added
- Line-article in sales details to group composition and components with the same identifier.
- Optional column description on table filters.
- Progression feedback when importing products.

### Changed
- Returning to the product list from the edition form reselects the original category of the product.

### Fixed
- Tariff area uses price and price with taxes instead of price only.
- Escape url parameters to allow slashes in references.
- The balance of the customer in customer list is localized.
- The ticket shows itself when searching again after a empty result set.


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
