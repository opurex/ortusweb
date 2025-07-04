# Ortus BackOffice

Ortus BackOffice is a lightweight, full-JavaScript back-office interface for managing your POS data. Designed for easy deployment and minimal maintenance, Ortus BackOffice connects to your backend API securely and efficiently to manage core administrative features such as inventory, user permissions, and reports. It does **not** handle sales registration — this is strictly a management tool for back-office operations.

## Proprietary License

This software is proprietary and owned by Opurex Ortus. Unauthorized copying, distribution, or modification of this software is strictly prohibited. For licensing inquiries, contact support@opurex.com.

---

## Installation

Ortus BackOffice works with no special server-side setup. Simply upload the files to your web server or run locally in your browser.

> ⚠️ Note: Running locally (i.e., from `file://`) may cause CORS issues depending on your API configuration.

### Development / Testing Setup

To use Ortus BackOffice in development mode:
1. Copy the contents of this project into any HTTP-accessible directory.
2. Open `index.html` in your browser to begin.

> VueJS development builds are used directly from the `src` directory in this mode. No bundling tools are required.

---

## Building a Release Version

A production-ready build can be generated using the provided Python script:

```bash
python release.py <version>
