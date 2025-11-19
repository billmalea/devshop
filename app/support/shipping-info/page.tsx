export const metadata = {
  title: 'Shipping Info - DevShop',
  description: 'Shipping information and delivery options',
}

export default function ShippingInfoPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-black mb-6">Shipping Information</h1>

          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-black mb-4">Delivery Methods</h2>
              
              <div className="space-y-4">
                <div className="border border-black/10 rounded-lg p-6 bg-gray-50">
                  <h3 className="font-bold text-black mb-2">Standard Delivery</h3>
                  <p className="text-black/70 mb-2">2-3 business days in Nairobi, 3-5 days upcountry</p>
                  <p className="text-sm text-black/60">Delivery fee: KES 300 (free for orders above KES 5,000)</p>
                </div>

                <div className="border border-black/10 rounded-lg p-6 bg-gray-50">
                  <h3 className="font-bold text-black mb-2">Pickup Mtaani</h3>
                  <p className="text-black/70 mb-2">Available at various locations in Nairobi and suburbs</p>
                  <p className="text-sm text-black/60">Usually available within 24 hours of order</p>
                </div>

                <div className="border border-black/10 rounded-lg p-6 bg-gray-50">
                  <h3 className="font-bold text-black mb-2">Pay on Delivery</h3>
                  <p className="text-black/70 mb-2">Pay when you pick up or receive your order</p>
                  <p className="text-sm text-black/60">Available for Pickup Mtaani and select locations</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4">Tracking Your Order</h2>
              <p className="text-black/70 mb-4">
                Once your order is placed, you'll receive a tracking number via email. You can use this to track your shipment in real-time.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4">Shipping Restrictions</h2>
              <ul className="list-disc list-inside space-y-2 text-black/70">
                <li>We currently ship within Kenya only</li>
                <li>Some remote areas may take longer</li>
                <li>Orders during weekends/holidays may be delayed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
