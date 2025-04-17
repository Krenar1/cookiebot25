import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Simple Cookie Consent System</h1>
        <p className="text-xl mb-8">Add cookie consent to your website with a simple embed code</p>

        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-2">Get Started</h2>
          <p className="mb-4">Access the admin panel to create your cookie consent and get your embed code.</p>
          <Link href="/admin/login">
            <Button>Access Admin Panel</Button>
          </Link>
          <p className="mt-2 text-sm text-gray-500">Default passcode: cookie123</p>
        </div>

        <h2 className="text-2xl font-bold mb-4">How It Works</h2>
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <div className="p-4 border rounded-lg">
            <div className="font-bold text-2xl mb-2">1</div>
            <h3 className="font-semibold mb-2">Add Your Domains</h3>
            <p className="text-sm">Specify which domains are allowed to use your cookie consent.</p>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="font-bold text-2xl mb-2">2</div>
            <h3 className="font-semibold mb-2">Choose a Design</h3>
            <p className="text-sm">Select from 10 pre-made designs for your cookie consent banner.</p>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="font-bold text-2xl mb-2">3</div>
            <h3 className="font-semibold mb-2">Get Your Code</h3>
            <p className="text-sm">
              Copy the embed code and add it to your website. Only authorized domains will be able to use it.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
