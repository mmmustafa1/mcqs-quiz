import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, Mail, Lock, User } from 'lucide-react'

export function AuthForm() {
  const { signIn, signUp, resetPassword } = useAuth()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [resetEmail, setResetEmail] = useState('')
  const [showResetForm, setShowResetForm] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setLoading(true)
    await signIn(email, password)
    setLoading(false)
  }
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !name) return

    if (password.length < 6) {
      alert('Password must be at least 6 characters long')
      return
    }

    if (name.trim().length < 2) {
      alert('Name must be at least 2 characters long')
      return
    }

    setLoading(true)
    await signUp(email, password, name.trim())
    setLoading(false)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetEmail) return

    setLoading(true)
    await resetPassword(resetEmail)
    setLoading(false)
    setShowResetForm(false)
    setResetEmail('')
  }
  if (showResetForm) {
    return (
      <Card className="w-full max-w-md mx-auto card-enhanced">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl gradient-text">Reset Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a reset link
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleResetPassword} className="space-y-6">            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />                <Input
                  id="reset-email"
                  type="email"
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="pl-10 h-12 border-2 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                  required
                />
              </div>
            </div>            <div className="space-y-3">              <Button type="submit" className="w-full h-12 btn-gradient text-lg font-semibold text-white" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Link
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full h-12 hover:bg-gray-100 dark:hover:bg-gray-800"                onClick={() => setShowResetForm(false)}
              >
                Back to Sign In
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }  return (
    <Card className="w-full max-w-md mx-auto card-enhanced">
      <CardHeader className="space-y-4 text-center">
        <CardTitle className="text-2xl gradient-text">Welcome</CardTitle>
        <CardDescription>
          Sign in to your account or create a new one
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="tabs-enhanced grid w-full grid-cols-2 h-12">
            <TabsTrigger value="signin" className="tab-trigger-enhanced">Sign In</TabsTrigger>
            <TabsTrigger value="signup" className="tab-trigger-enhanced">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="space-y-6 pt-6">
            <form onSubmit={handleSignIn} className="space-y-6">              <div className="space-y-2">
                <Label htmlFor="signin-email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-2 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                    required
                  />
                </div>
              </div>              <div className="space-y-2">
                <Label htmlFor="signin-password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-500" />                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 border-2 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                    required
                  />
                </div>
              </div>              <div className="space-y-3">                <Button type="submit" className="w-full h-12 btn-gradient text-lg font-semibold text-white" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setShowResetForm(true)}
                >
                  Forgot your password?
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="signup" className="space-y-6 pt-6">
            <form onSubmit={handleSignUp} className="space-y-6">              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 h-12 border-2 focus:border-green-500 dark:focus:border-green-400 focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                    minLength={2}
                    required
                  />
                </div>
              </div>              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-2 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                    required
                  />
                </div>
              </div>              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-500" />                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password (min. 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 border-2 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                    minLength={6}
                    required
                  />
                </div>
              </div>              <Button type="submit" className="w-full h-12 btn-gradient text-lg font-semibold text-white" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
