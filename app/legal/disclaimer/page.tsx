export const metadata = {
  title: 'Disclaimer - DevShop',
  description: 'Legal Disclaimer for DevShop',
}

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-black mb-6">Disclaimer</h1>
          <p className="text-sm text-black/60 mb-12">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-6 text-black/70">
            <div>
              <h2 className="text-2xl font-bold text-black mb-3">General Disclaimer</h2>
              <p>The information provided on DevShop is for general informational purposes only. We make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the website or its contents.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-3">Product Information</h2>
              <p>While we strive to provide accurate product descriptions and images, we do not warrant that product descriptions, pricing, or other content is accurate, complete, reliable, current, or error-free. If a product offered is not as described, your sole remedy is to return it in unused condition.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-3">Limitation of Liability</h2>
              <p>In no event shall DevShop, its directors, employees, or agents be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the website or products.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-3">Third-Party Links</h2>
              <p>Our website may contain links to third-party websites. We are not responsible for the content, accuracy, or practices of these external sites. Your use of third-party websites is at your own risk and subject to their terms and conditions.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-3">Changes to Disclaimer</h2>
              <p>We reserve the right to modify this disclaimer at any time without notice. Your continued use of the website constitutes your acceptance of the updated disclaimer.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-3">Contact</h2>
              <p>For questions or concerns about this disclaimer, please contact us at support@devshop.ke</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
