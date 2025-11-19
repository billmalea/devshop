export const metadata = {
  title: 'Cookie Policy - DevShop',
  description: 'Cookie Policy for DevShop',
}

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-black mb-6">Cookie Policy</h1>
          <p className="text-sm text-black/60 mb-12">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-6 text-black/70">
            <div>
              <h2 className="text-2xl font-bold text-black mb-3">What Are Cookies?</h2>
              <p>Cookies are small files that are stored on your computer when you visit our website. They help us remember your preferences and improve your experience.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-3">Types of Cookies We Use</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-black mb-1">Essential Cookies</h3>
                  <p>Required for the website to function properly, such as authentication and security.</p>
                </div>
                <div>
                  <h3 className="font-bold text-black mb-1">Performance Cookies</h3>
                  <p>Help us understand how you use our website to improve performance.</p>
                </div>
                <div>
                  <h3 className="font-bold text-black mb-1">Marketing Cookies</h3>
                  <p>Used to track your preferences for targeted advertising (optional).</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-3">Your Cookie Choices</h2>
              <p>You can control cookies through your browser settings. Most browsers allow you to refuse cookies or alert you when cookies are being sent. However, blocking cookies may affect website functionality.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-3">Third-Party Cookies</h2>
              <p>We may allow third parties (such as analytics providers) to place cookies on our website. These are governed by their privacy policies.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-3">Contact Us</h2>
              <p>For questions about our cookie policy, contact us at support@devshop.ke</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
