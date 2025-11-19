export const metadata = {
  title: 'FAQs - DevShop',
  description: 'Frequently asked questions about DevShop',
}

export default function FAQsPage() {
  const faqs = [
    {
      question: 'How long does delivery take?',
      answer: 'Delivery typically takes 2-3 business days within Nairobi and 3-5 days for other regions. Express delivery via Pickup Mtaani is available for next-day delivery in select locations.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept M-Pesa, credit/debit cards, and offer a "Pay on Delivery" option for Pickup Mtaani orders.'
    },
    {
      question: 'Can I return or exchange items?',
      answer: 'Yes, we accept returns and exchanges within 30 days of purchase if items are unused and in original packaging. See our Returns & Refunds page for more details.'
    },
    {
      question: 'Do you offer bulk discounts?',
      answer: 'Yes! For orders of 10+ items, please contact us at support@devshop.ke for special pricing.'
    },
    {
      question: 'Are the prints durable?',
      answer: 'All our merchandise features high-quality, durable prints that last through multiple washes. We guarantee quality on all items.'
    },
    {
      question: 'Do you ship internationally?',
      answer: 'Currently, we only ship within Kenya. International shipping may be available soon.'
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-black mb-6">Frequently Asked Questions</h1>
          <p className="text-lg text-black/70 mb-12">
            Find answers to common questions about our products and services.
          </p>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-black/10 rounded-lg p-6 bg-gray-50">
                <h3 className="font-bold text-black text-lg mb-3">{faq.question}</h3>
                <p className="text-black/70 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
