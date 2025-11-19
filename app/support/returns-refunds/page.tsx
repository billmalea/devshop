export const metadata = {
  title: 'Returns & Refunds - DevShop',
  description: 'Return and refund policy information',
}

export default function ReturnsRefundsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-black mb-6">Returns & Refunds</h1>

          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-black mb-4">Return Policy</h2>
              <p className="text-black/70 leading-relaxed mb-4">
                We want you to be completely satisfied with your purchase. If for any reason you're not happy, we accept returns within 30 days of purchase.
              </p>
              <p className="text-black/70 leading-relaxed">
                Items must be unused, unworn, and in original packaging with all tags attached.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4">How to Return</h2>
              <ol className="list-decimal list-inside space-y-3 text-black/70">
                <li>Contact us at support@devshop.ke with your order number</li>
                <li>Pack the item securely in original packaging</li>
                <li>Use the return label provided or arrange pickup via Pickup Mtaani</li>
                <li>Once received and inspected, we'll process your refund</li>
              </ol>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4">Refund Timeline</h2>
              <p className="text-black/70 mb-2">
                Refunds are processed within 5-7 business days after we receive and inspect your return. M-Pesa refunds will be sent to your registered number.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4">Non-Returnable Items</h2>
              <ul className="list-disc list-inside space-y-2 text-black/70">
                <li>Sticker packs (once applied)</li>
                <li>Items with visible wear or damage</li>
                <li>Items purchased during final sale promotions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
