export const metadata = {
  title: 'Privacy Policy - DevShop',
  description: 'Privacy Policy for DevShop',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-black mb-6">Privacy Policy</h1>
          <p className="text-sm text-black/60 mb-12">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-6 text-black/70">
            <div>
              <h2 className="text-2xl font-bold text-black mb-3">Introduction</h2>
              <p>DevShop is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-3">Information We Collect</h2>
              <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This may include your name, email address, phone number, and payment information.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-3">How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Process your orders and send related information</li>
                <li>Send promotional emails (if you&apos;ve opted in)</li>
                <li>Improve our website and services</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-3">Data Security</h2>
              <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-3">Third-Party Services</h2>
              <p>We may use third-party payment processors and shipping partners. We are not responsible for their privacy practices. Please review their privacy policies.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-3">Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at support@devshop.ke</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
