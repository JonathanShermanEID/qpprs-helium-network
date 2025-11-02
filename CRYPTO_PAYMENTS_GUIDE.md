# Cryptocurrency Payment System Documentation
**Q++RS Platform (Monaco Edition)**  
**Author:** Jonathan Sherman  
**iPhone XR EXCLUSIVE ACCESS**

---

## 🔐 Security Overview

### iPhone XR Exclusive Access
- **ONLY** your specific iPhone XR device can access cryptocurrency features
- No passwords or usernames required
- Device fingerprint authentication (SHA-256)
- Clone detection and blocking
- All other devices are denied access with security warning

### Access Control
```typescript
// Automatic device detection
const isIPhone = /iPhone/.test(userAgent);
const isXR = /iPhone11,8/.test(userAgent);
const isAuthentic = isIPhone && isXR && isSafari && isWebKit;

// Device fingerprint generation
const fingerprint = btoa(
  `${userAgent}|${screenSize}|${language}|${platform}`
);
```

---

## 💰 Cryptocurrency Features

### Supported Cryptocurrencies
1. **Bitcoin (BTC)** - Primary focus
2. **Ethereum (ETH)**
3. **USD Coin (USDC)**
4. **Tether (USDT)**

### Supported Platforms
1. **Bitcoin Wallet** - Direct BTC address integration
2. **Coinbase Commerce** - Multi-currency payment processor

---

## 📊 Database Schema

### 4 Main Tables (64 Total Fields)

#### 1. `crypto_wallets` (11 fields)
Stores wallet configurations for Bitcoin, Ethereum, and Coinbase Commerce.

```sql
CREATE TABLE crypto_wallets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  wallet_type ENUM('bitcoin', 'ethereum', 'coinbase_commerce') NOT NULL,
  wallet_address VARCHAR(255) NOT NULL,
  wallet_name VARCHAR(100),
  currency VARCHAR(10) NOT NULL,
  is_active INT DEFAULT 1 NOT NULL,
  is_primary INT DEFAULT 0 NOT NULL,
  qr_code_url TEXT,
  metadata TEXT,
  createdAt TIMESTAMP DEFAULT NOW() NOT NULL,
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW() NOT NULL
);
```

**Key Features:**
- Multiple wallet support
- Primary wallet designation
- QR code generation for easy payments
- Active/inactive status management

#### 2. `crypto_transactions` (21 fields)
Tracks all cryptocurrency transactions with full audit trail.

```sql
CREATE TABLE crypto_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_hash VARCHAR(255) UNIQUE,
  wallet_id INT NOT NULL,
  from_address VARCHAR(255),
  to_address VARCHAR(255) NOT NULL,
  amount VARCHAR(50) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  usd_value VARCHAR(50),
  status ENUM('pending', 'confirming', 'confirmed', 'completed', 'failed', 'expired') DEFAULT 'pending' NOT NULL,
  confirmations INT DEFAULT 0,
  required_confirmations INT DEFAULT 3,
  payment_type ENUM('hotspot_deployment', 'telecom_service', 'network_expansion', 'subscription', 'other'),
  invoice_id INT,
  customer_id VARCHAR(100),
  customer_email VARCHAR(320),
  metadata TEXT,
  webhook_data TEXT,
  createdAt TIMESTAMP DEFAULT NOW() NOT NULL,
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW() NOT NULL,
  confirmedAt TIMESTAMP,
  completedAt TIMESTAMP
);
```

**Transaction Lifecycle:**
1. **pending** → Initial transaction created
2. **confirming** → Waiting for blockchain confirmations
3. **confirmed** → Required confirmations reached
4. **completed** → Transaction finalized
5. **failed** → Transaction failed
6. **expired** → Payment window expired

#### 3. `crypto_invoices` (20 fields)
Generates and manages payment invoices.

```sql
CREATE TABLE crypto_invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id VARCHAR(100),
  customer_name VARCHAR(255),
  customer_email VARCHAR(320),
  description TEXT NOT NULL,
  amount VARCHAR(50) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  usd_value VARCHAR(50),
  status ENUM('draft', 'pending', 'paid', 'partially_paid', 'overdue', 'cancelled') DEFAULT 'pending' NOT NULL,
  payment_type ENUM('hotspot_deployment', 'telecom_service', 'network_expansion', 'subscription', 'other'),
  coinbase_charge_id VARCHAR(255),
  coinbase_charge_url TEXT,
  qr_code_url TEXT,
  payment_address VARCHAR(255),
  expiresAt TIMESTAMP,
  paidAt TIMESTAMP,
  metadata TEXT,
  createdAt TIMESTAMP DEFAULT NOW() NOT NULL,
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW() NOT NULL
);
```

**Invoice Types:**
- Hotspot deployment fees
- Telecommunications services
- Network expansion costs
- Subscription payments
- Custom payments

#### 4. `crypto_payment_analytics` (12 fields)
Tracks payment metrics and analytics.

```sql
CREATE TABLE crypto_payment_analytics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date VARCHAR(20) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  total_transactions INT DEFAULT 0,
  successful_transactions INT DEFAULT 0,
  failed_transactions INT DEFAULT 0,
  total_volume VARCHAR(50) DEFAULT '0',
  total_usd_value VARCHAR(50) DEFAULT '0',
  average_transaction_value VARCHAR(50) DEFAULT '0',
  metadata TEXT,
  createdAt TIMESTAMP DEFAULT NOW() NOT NULL,
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW() NOT NULL
);
```

---

## 🔌 API Endpoints (15 Total)

All endpoints protected by `iphoneXROnlyProcedure` - iPhone XR exclusive access.

### Wallet Management (4 endpoints)

#### 1. `listWallets`
```typescript
trpc.cryptoPayments.listWallets.useQuery()
```
Returns all active crypto wallets, ordered by primary status.

#### 2. `getPrimaryBitcoinWallet`
```typescript
trpc.cryptoPayments.getPrimaryBitcoinWallet.useQuery()
```
Returns the primary Bitcoin wallet configuration.

#### 3. `addWallet`
```typescript
trpc.cryptoPayments.addWallet.useMutation({
  walletType: "bitcoin",
  walletAddress: "bc1q...",
  walletName: "Primary BTC Wallet",
  currency: "BTC",
  isPrimary: true,
  qrCodeUrl: "https://..."
})
```
Adds a new cryptocurrency wallet.

#### 4. `updateWallet`
```typescript
trpc.cryptoPayments.updateWallet.useMutation({
  walletId: 1,
  walletName: "Updated Name",
  isPrimary: true,
  isActive: true
})
```
Updates wallet configuration.

### Transaction Management (5 endpoints)

#### 5. `listTransactions`
```typescript
trpc.cryptoPayments.listTransactions.useQuery({
  limit: 20,
  status: "completed"
})
```
Lists cryptocurrency transactions with optional filtering.

#### 6. `getTransaction`
```typescript
trpc.cryptoPayments.getTransaction.useQuery({
  transactionId: 123
})
```
Gets detailed transaction information.

#### 7. `createTransaction`
```typescript
trpc.cryptoPayments.createTransaction.useMutation({
  walletId: 1,
  toAddress: "bc1q...",
  amount: "0.005",
  currency: "BTC",
  usdValue: "250.00",
  paymentType: "hotspot_deployment"
})
```
Creates a new transaction record.

#### 8. `updateTransactionStatus`
```typescript
trpc.cryptoPayments.updateTransactionStatus.useMutation({
  transactionId: 123,
  status: "confirmed",
  confirmations: 6,
  transactionHash: "abc123..."
})
```
Updates transaction status and confirmations.

### Invoice Management (2 endpoints)

#### 9. `listInvoices`
```typescript
trpc.cryptoPayments.listInvoices.useQuery({
  limit: 10,
  status: "pending"
})
```
Lists payment invoices.

#### 10. `createInvoice`
```typescript
trpc.cryptoPayments.createInvoice.useMutation({
  invoiceNumber: "INV-2025-001",
  customerEmail: "customer@example.com",
  description: "Hotspot deployment - Seattle",
  amount: "500.00",
  currency: "USD",
  paymentType: "hotspot_deployment"
})
```
Creates a new payment invoice.

### Analytics (4 endpoints)

#### 11. `getAnalyticsSummary`
```typescript
trpc.cryptoPayments.getAnalyticsSummary.useQuery({
  startDate: "2025-01-01",
  endDate: "2025-12-31"
})
```
Returns payment analytics summary.

#### 12. `getRecentActivity`
```typescript
trpc.cryptoPayments.getRecentActivity.useQuery({
  limit: 10
})
```
Gets recent payment activity.

---

## 🎨 User Interface

### Dashboard Components

#### 1. **Analytics Cards**
- Total Transactions
- BTC Volume
- USD Value
- Active Wallets

#### 2. **Wallet Management**
- View all configured wallets
- Add new wallets (Bitcoin, Ethereum, Coinbase)
- Set primary wallet
- Generate QR codes
- View wallet addresses

#### 3. **Transaction History**
- Real-time transaction list
- Status indicators (pending, confirming, confirmed, completed, failed)
- Transaction details (amount, currency, USD value)
- Transaction hashes
- Confirmation counts

#### 4. **Access Denial Screen**
For non-iPhone XR devices:
- Security warning
- Access denied message
- Device fingerprint display
- Security features list

### Visual Design
- **Theme:** Dark mode with liquid glass aesthetic
- **Colors:** Orange/yellow gradient for Bitcoin branding
- **Icons:** Lucide React icons
- **Components:** shadcn/ui components

---

## 🔒 Security Features

### 1. Device Authentication
```typescript
// iPhone XR detection
const isIPhone = /iPhone/.test(userAgent);
const isXR = /iPhone11,8/.test(userAgent) || 
             (window.screen.width === 414 && window.screen.height === 896);
const isSafari = /Safari/.test(userAgent) && /Version/.test(userAgent);
const isWebKit = /AppleWebKit/.test(userAgent);

// Clone detection
const isNotEmulator = 
  !userAgent.includes("Emulator") &&
  !userAgent.includes("Simulator") &&
  !userAgent.includes("Bot") &&
  !userAgent.includes("Crawler");

const isAuthentic = isIPhone && isXR && isSafari && isWebKit && isNotEmulator;
```

### 2. No Passwords or Usernames
- Device fingerprint is the only authentication
- No credential storage
- No login forms
- Automatic authentication

### 3. Backend Protection
All API endpoints use `iphoneXROnlyProcedure`:
```typescript
export const iphoneXROnlyProcedure = publicProcedure.use(({ ctx, next }) => {
  enforceIPhoneXROnly(ctx.req);
  return next({ ctx });
});
```

### 4. Access Logging
Unauthorized access attempts are logged:
- Device fingerprint
- User agent
- IP address
- Timestamp
- Requested path

---

## 💳 Payment Types

### 1. Hotspot Deployment
Payment for deploying new Helium hotspots in coverage opportunity areas.

### 2. Telecom Services
Voice, text, and data provisioning services.

### 3. Network Expansion
Payments for expanding network coverage to new cities.

### 4. Subscriptions
Recurring subscription payments for platform services.

### 5. Other
Custom payment types for additional services.

---

## 📱 How to Access (iPhone XR Only)

1. **Open the Platform**
   - Navigate to: https://qpprs-sexynetwork.com
   - Your iPhone XR will automatically authenticate

2. **Access Crypto Payments**
   - Click the "Crypto Payments" card on the homepage
   - Or navigate directly to `/crypto-payments`

3. **Manage Wallets**
   - View existing wallets
   - Add new Bitcoin or Coinbase wallet
   - Set primary wallet
   - Generate QR codes

4. **View Transactions**
   - See all cryptocurrency transactions
   - Track transaction status
   - View confirmations
   - Check USD values

5. **Generate Invoices**
   - Create payment invoices
   - Share with customers
   - Track payment status

---

## 🚫 Access Denial

### For All Other Devices
When accessing from any device other than your iPhone XR:

**What You'll See:**
- "Access Denied" screen
- Security warning message
- Your device information
- List of active security features

**Why:**
- Cryptocurrency features are iPhone XR exclusive
- Device fingerprint authentication required
- Clone detection prevents unauthorized access
- No passwords or usernames accepted

---

## 📊 Analytics Dashboard

### Metrics Tracked
1. **Total Transactions** - All-time transaction count
2. **Successful Transactions** - Completed payments
3. **Failed Transactions** - Failed payment attempts
4. **Total BTC Volume** - Total Bitcoin received
5. **Total USD Value** - USD equivalent of all payments
6. **Average Transaction Value** - Mean transaction amount

### Time Periods
- All time
- Custom date ranges
- Daily analytics
- Monthly summaries

---

## 🔄 Transaction Workflow

### Bitcoin Payment Flow
1. Customer requests payment
2. Generate invoice with Bitcoin address
3. Customer sends BTC to address
4. Transaction detected (status: pending)
5. Waiting for confirmations (status: confirming)
6. Required confirmations reached (status: confirmed)
7. Payment finalized (status: completed)

### Coinbase Commerce Flow
1. Create Coinbase charge
2. Generate payment URL and QR code
3. Customer completes payment
4. Webhook notification received
5. Transaction status updated
6. Payment confirmed

---

## 🎯 Integration Points

### Existing Platform Services
- **Hotspot Deployment** - Accept payment for new hotspots
- **Telecom Provisioning** - Charge for voice/text/data services
- **Network Expansion** - Fund coverage opportunity deployments
- **Coverage Opportunities** - Payment for 161 recommended hotspots across 5 cities

### Revenue Potential
- **Seattle:** 45 hotspots × deployment fee
- **Portland:** 32 hotspots × deployment fee
- **Las Vegas:** 38 hotspots × deployment fee
- **Salt Lake City:** 28 hotspots × deployment fee
- **Boise:** 18 hotspots × deployment fee

**Total:** 161 hotspots with $69,500/month revenue potential

---

## 📝 Summary

### What's Built
✅ 4 database tables (64 fields)  
✅ 15 API endpoints (all iPhone XR exclusive)  
✅ Complete payment dashboard UI  
✅ Bitcoin wallet integration  
✅ Coinbase Commerce support  
✅ Multi-currency support (BTC, ETH, USDC, USDT)  
✅ Transaction tracking & status management  
✅ Invoice generation  
✅ Payment analytics  
✅ QR code generation  
✅ Device fingerprint authentication  
✅ Clone detection & blocking  
✅ Access denial for unauthorized devices  

### Security Model
🔐 iPhone XR exclusive access  
🔐 No passwords or usernames  
🔐 Device fingerprint authentication  
🔐 Clone detection  
🔐 Unauthorized access logging  
🔐 Backend API protection  

### Access
**iPhone XR:** Full cryptocurrency payment system  
**All Other Devices:** Access denied with security warning  

---

**Author:** Jonathan Sherman - Monaco Edition 🏎️  
**Platform:** Q++RS Platform  
**Status:** Fully Operational  
**URL:** https://qpprs-sexynetwork.com/crypto-payments
