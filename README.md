<p align="center">
  <img src="https://raw.githubusercontent.com/Divya-SC/SendShield/main/sendshield-logo.png" width="300">
</p>

<h1 align="center">SendShield</h1>

<p align="center">
Protecting users from risky crypto wallet addresses before funds are sent.
</p>

# SendShield

SendShield is a Chrome extension designed to help users identify potentially risky cryptocurrency wallet addresses before sending funds.

## Overview

Crypto transactions are irreversible. SendShield provides an additional safety layer by detecting wallet addresses that appear in a maintained threat database and displaying warning messages before a transaction is completed.

## Features

* Chrome Extension
* Wallet Address Detection
* Scam Wallet Alerts
* Sanctioned Wallet Alerts
* High-Risk Wallet Alerts
* Warning Popups on Supported Pages
* External JSON-Based Threat Database (`wallets.json`)

## Current Version

### SendShield v1.0

Current capabilities:

* Detects wallet addresses entered on supported websites
* Compares addresses against a threat database
* Displays security warnings for flagged wallets
* Loads wallet intelligence from an external JSON file
* Tested on cryptocurrency withdrawal workflows

## Technical Architecture

SendShield currently uses:

* Manifest V3 Chrome Extension
* Content Scripts
* Dynamic JSON Database Loading
* Browser-Based Wallet Detection

No external APIs or blockchain intelligence providers are currently integrated.

## Roadmap

### Version 1.1

* GitHub-hosted threat database
* Easier threat intelligence updates
* Expanded threat database coverage

### Version 2.0

* External API integrations
* Blockchain intelligence integrations
* Community information integrations
* Sanctions data integrations
* Social media and security alert monitoring
* Wallet labeling and categorization
* Exchange wallet identification

### Version 3.0

* Multi-source threat intelligence
* Advanced wallet analysis
* Behavior-based risk detection
* Risk assessment engine
* Cross-source intelligence correlation
* Real-time threat detection capabilities

## Project Status

SendShield is currently an MVP (Minimum Viable Product) focused on validating wallet risk detection workflows and browser-based transaction safety warnings.

## Mission

Help crypto users identify potentially risky wallet addresses before funds are sent.
