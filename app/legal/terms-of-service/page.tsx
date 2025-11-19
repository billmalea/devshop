export const metadata = {
  title: 'Terms of Service - DevShop',
  description: 'Terms of Service for DevShop',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-black mb-6">Terms of Service</h1>
          <p className="text-sm text-black/60 mb-12">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-sm max-w-none text-black/70 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-black mb-3">1. Acceptance of Terms</h2>
              <p>By accessing and using DevShop, you accept and agree to be bound by the terms and provision of this agreement.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-3">2. Use License</h2>
              <p>Permission is granted to temporarily download one copy of the materials (information or software) on DevShop for personal, non-commercial transitory viewing only.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-3">3. Disclaimer</h2>
              <p>The materials on DevShop are provided on an 'as is' basis. DevShop makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-3">4. Limitations</h2>
              <p>In no event shall DevShop or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on DevShop.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-3">5. Accuracy of Materials</h2>
              <p>The materials appearing on DevShop could include technical, typographical, or photographic errors. DevShop does not warrant that any of the materials on its Website are accurate, complete, or current.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-3">6. Links</h2>
              <p>DevShop has not reviewed all of the sites linked to its Website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by DevShop of the site. Use of any such linked website is at the user's own risk.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-3">7. Modifications</h2>
              <p>DevShop may revise these terms of service for its Website at any time without notice. By using this Website, you are agreeing to be bound by the then current version of these terms of service.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
