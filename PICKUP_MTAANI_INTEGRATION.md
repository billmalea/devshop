# Pickup Mtaani Integration Guide

## Overview
This document describes the Pickup Mtaani API integration for delivery management in the DevShop e-commerce platform.

## Environment Setup

Add these variables to your `.env.local` file:

```env
PICKUP_MTAANI_API_KEY=your_api_key_here
NEXT_PUBLIC_PICKUP_MTAANI_API_URL=https://api.pickupmtaani.com/api/v1
```

## API Client

The `lib/pickupmtaani.ts` file provides a complete TypeScript API client with:

### Location Services
- `getAgentLocations()` - Get all agent pickup locations
- `getAreas()` - Get delivery areas
- `getZones()` - Get delivery zones

### Delivery Charges
- `getAgentPackageCharge(origin, destination, weight?)` - Calculate agent-to-agent delivery fee
- `getDoorstepPackageCharge(origin, destination, weight?)` - Calculate doorstep delivery fee

### Package Management
- `createAgentPackage(data)` - Create a new delivery package
- `getAgentPackage(packageId)` - Get package details
- `getMyAgentPackages()` - List all your packages
- `updateAgentPackage(packageId, data)` - Update package info
- `deleteAgentPackage(packageId)` - Cancel a package
- `getUnpaidPackages()` - Get packages with pending payment

### Payment
- `payWithMpesaSTK(data)` - Initiate M-Pesa STK push
- `verifyPayment(transactionId)` - Verify payment status

### Business Management
- `getBusinessDetails()` - Get your business profile
- `updateBusinessDetails(data)` - Update business info
- `registerWebhook(url, events)` - Register webhook for status updates

## API Endpoints

### `/api/pickup-mtaani/locations`
**GET** - Fetch all available pickup locations
```typescript
// Response
{
  data: [
    {
      agent_location: "Nairobi CBD",
      town: "Nairobi"
    }
  ]
}
```

### `/api/pickup-mtaani/delivery-charge`
**GET** - Calculate delivery fee
```typescript
// Query params: origin, destination, weight (optional)
// Response
{
  amount: 150,
  currency: "KES"
}
```

### `/api/pickup-mtaani/packages`
**GET** - List all packages or get specific package
```typescript
// Query param: id (optional)
// Response
{
  data: [...]
}
```

**POST** - Create new delivery package
```typescript
// Request body
{
  originId: "nairobi-cbd",
  destinationId: "westlands",
  packageDescription: "Electronics",
  recipientName: "John Doe",
  recipientPhone: "0712345678",
  weight: 2.5,
  value: 5000,
  paymentMode: "PREPAID" | "COD",
  codAmount?: 5000
}
```

### `/api/webhooks/pickup-mtaani`
**POST** - Webhook endpoint for delivery status updates

Pickup Mtaani will POST to this endpoint when:
- Package status changes
- Package is delivered
- Delivery fails

## User Features (Checkout)

1. **Dynamic Pickup Locations** - Locations are fetched from Pickup Mtaani API in real-time
2. **Delivery Method Selection** - Users choose between home delivery or pickup
3. **Package Creation** - Orders automatically create delivery packages (to be implemented)
4. **Real-time Delivery Charges** - Shipping costs calculated via API

## Admin Features

### Deliveries Page (`/admin/deliveries`)
- View all delivery packages
- Track delivery status
- See recipient details
- Monitor delivery fees
- Filter by status (Pending, In Transit, Delivered, Failed)
- Refresh to get latest updates

### Webhook Management
Webhooks are handled at `/api/webhooks/pickup-mtaani` to receive:
- Package status changes
- Delivery confirmations
- Failed delivery notifications

## Integration Checklist

- [x] API client created (`lib/pickupmtaani.ts`)
- [x] Environment variables configured (`.env.example`)
- [x] Locations endpoint (`/api/pickup-mtaani/locations`)
- [x] Delivery charge endpoint (`/api/pickup-mtaani/delivery-charge`)
- [x] Package management endpoints (`/api/pickup-mtaani/packages`)
- [x] Admin deliveries page (`/admin/deliveries`)
- [x] Webhook handler (`/api/webhooks/pickup-mtaani`)
- [x] Checkout updated with dynamic locations
- [ ] Package creation on order placement
- [ ] M-Pesa payment integration
- [ ] Customer delivery tracking page
- [ ] Email/SMS notifications

## Next Steps

1. **Implement Package Creation in Checkout**
   - When user completes order, call `/api/pickup-mtaani/packages` POST
   - Store package ID in orders database
   - Show tracking code to customer

2. **Payment Integration**
   - Integrate M-Pesa STK push for delivery fees
   - Handle payment verification
   - Update package status after payment

3. **Customer Tracking**
   - Create `/orders/[id]/track` page
   - Show delivery status and tracking code
   - Display estimated delivery time

4. **Notifications**
   - Send email when package is created
   - SMS notifications for status changes
   - Push notifications for delivery updates

## Testing

Before going live:
1. Add your Pickup Mtaani API key to `.env.local`
2. Test location fetching on checkout page
3. Test delivery charge calculation
4. Create test packages through admin
5. Verify webhook receives status updates
6. Test M-Pesa payment flow

## Support

- Pickup Mtaani API Docs: https://api.pickupmtaani.com/api/v1/docs/
- Contact: support@pickupmtaani.com
