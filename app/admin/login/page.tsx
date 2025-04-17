"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const [passcode, setPasscode] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ passcode }),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect to admin dashboard
        router.push("/admin/dashboard")
      } else {
        setError(data.error || "Invalid passcode")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Enter the passcode to access the admin panel</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Enter passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
