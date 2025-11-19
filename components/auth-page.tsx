"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { Facebook, Mail, Chrome } from "lucide-react"

interface AuthPageProps {
  onAuthenticate: () => void
}

export function AuthPage({ onAuthenticate }: AuthPageProps) {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""))
  const [timer, setTimer] = useState(0)
  const [debugOtp, setDebugOtp] = useState<string | null>(null) // 👈 thêm state OTP hiển thị
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  const API_URL = "http://192.168.1.18:3001"

  // Countdown resend OTP
  useEffect(() => {
    if (timer <= 0) return
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000)
    return () => clearInterval(interval)
  }, [timer])

  // Gửi OTP
  const sendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      alert("Vui lòng nhập số điện thoại hợp lệ!")
      return
    }

    setTimer(60)
    setDebugOtp(null) // reset hiển thị OTP cũ

    // Xóa OTP cũ của số này
    const oldOtps = await fetch(`${API_URL}/otps?phoneNumber=${phoneNumber}`).then((r) => r.json())
    for (const item of oldOtps) {
      await fetch(`${API_URL}/otps/${item.id}`, { method: "DELETE" })
    }

    // Tạo OTP mới
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    await fetch(`${API_URL}/otps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber, otp }),
    })

    setDebugOtp(otp) // 👈 hiển thị OTP trên giao diện
    setStep("otp")
  }

  const handleOtpInput = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return
    const updated = [...otpDigits]
    updated[index] = value
    setOtpDigits(updated)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  // Xác minh OTP
  const verifyOTP = async () => {
    const otp = otpDigits.join("")
    if (otp.length !== 6) {
      alert("Vui lòng nhập đủ 6 số!")
      return
    }

    const res = await fetch(`${API_URL}/otps?phoneNumber=${phoneNumber}&otp=${otp}`)
    const found = await res.json()

    if (found.length === 0) {
      alert("Sai OTP hoặc OTP đã hết hạn!")
      return
    }

    // Xóa OTP sau khi dùng
    await fetch(`${API_URL}/otps/${found[0].id}`, { method: "DELETE" })

    // Kiểm tra user đã tồn tại chưa
    const checkUser = await fetch(`${API_URL}/users?phoneNumber=${phoneNumber}`)
    const users = await checkUser.json()
    let user

    if (users.length === 0) {
      const newUser = {
        phoneNumber,
        name: "User",
        avatar: "",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      }

      const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      })
      user = await res.json()
    } else {
      user = users[0]
      await fetch(`${API_URL}/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastLogin: new Date().toISOString() }),
      })
    }

    localStorage.setItem("authUser", JSON.stringify(user))
    localStorage.setItem("user", JSON.stringify(user))

    onAuthenticate()
  }

  // Đăng nhập bằng Google (Chỉ giao diện - chưa tích hợp)
  const handleGoogleLogin = () => {
    alert("Tính năng đăng nhập bằng Google sẽ được tích hợp sau!")
  }

  // Đăng nhập bằng Facebook (Chỉ giao diện - chưa tích hợp)
  const handleFacebookLogin = () => {
    alert("Tính năng đăng nhập bằng Facebook sẽ được tích hợp sau!")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-br from-background to-muted">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Logo */}
      <div className="mb-12 animate-fade-in">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-md">
          <div className="text-2xl font-bold text-primary-foreground">✈</div>
        </div>
      </div>

      {/* Form chính */}
      <div className="w-full max-w-sm bg-card rounded-2xl shadow-lg p-8 animate-slide-up border border-border">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {step === "phone" ? "Create an account" : "Verify your number"}
        </h1>

        <p className="text-muted-foreground text-sm mb-8">
          {step === "phone"
            ? "Enter your mobile number to get started"
            : "Enter the code sent to your phone"}
        </p>

        {step === "phone" ? (
          <>
            <div className="flex gap-2 mb-4">
              <select className="w-20 px-2 py-3 border border-border rounded-lg bg-input text-foreground text-sm font-medium">
                <option>🇻🇳 +84</option>
              </select>
              <Input
                type="tel"
                placeholder="Enter your number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1"
              />
            </div>
            <Button className="w-full py-3 font-semibold mb-6" onClick={sendOtp}>
              Continue
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full py-3 font-medium flex items-center justify-center gap-2 hover:bg-accent"
                onClick={handleGoogleLogin}
              >
                <Chrome className="w-5 h-5 text-blue-500" />
                <span>Continue with Google</span>
              </Button>

              <Button
                variant="outline"
                className="w-full py-3 font-medium flex items-center justify-center gap-2 hover:bg-accent"
                onClick={handleFacebookLogin}
              >
                <Facebook className="w-5 h-5 text-blue-600" />
                <span>Continue with Facebook</span>
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex gap-2 justify-center mb-4">
              {otpDigits.map((d, i) => (
                <Input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el }}
                  type="text"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleOtpInput(e.target.value, i)}
                  className="w-12 h-12 text-center text-lg font-bold border-2 focus:border-primary"
                />
              ))}
            </div>

            <div className="text-center text-sm mb-3 text-muted-foreground">
              {timer > 0 ? (
                <>Gửi lại mã sau <b>{timer}</b>s</>
              ) : (
                <button className="text-primary font-semibold" onClick={sendOtp}>
                  Gửi lại mã
                </button>
              )}
            </div>

            {/* 👇 Hiển thị OTP debug trong giao diện */}
            {debugOtp && (
              <div className="text-center text-xs mb-3 text-green-600 font-mono">
                (Mã OTP tạm thời: <b>{debugOtp}</b>)
              </div>
            )}

            <Button className="w-full py-3 font-semibold" onClick={verifyOTP}>
              Verify
            </Button>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
      `}</style>
    </div>
  )
}
