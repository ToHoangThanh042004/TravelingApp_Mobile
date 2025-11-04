"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Apple, Facebook, Mail } from "lucide-react"

interface AuthPageProps {
  onAuthenticate: () => void
}

export function AuthPage({ onAuthenticate }: AuthPageProps) {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""))
  const [timer, setTimer] = useState(0)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  const API_URL = "http://localhost:3001"

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
      body: JSON.stringify({ phoneNumber, otp })
    })

    alert("OTP (Debug): " + otp) // chỉ dùng tạm khi dev
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
      // Tạo user mới
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
        body: JSON.stringify(newUser)
      })
      user = await res.json()
    } else {
      // User đã có → cập nhật lastLogin
      user = users[0]
      await fetch(`${API_URL}/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastLogin: new Date().toISOString() })
      })
    }

    // Lưu thông tin user vào localStorage để HomePage đọc
    localStorage.setItem("authUser", JSON.stringify(user))
    localStorage.setItem("user", JSON.stringify(user))

    // Chuyển sang HomePage
    onAuthenticate()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-br from-background to-muted">
      {/* Logo */}
      <div className="mb-12 animate-fade-in">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
          <div className="text-2xl font-bold text-primary-foreground">✈</div>
        </div>
      </div>

      {/* Form chính */}
      <div className="w-full max-w-sm bg-card rounded-2xl shadow-lg p-8 animate-slide-up">
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
              <select className="w-16 px-2 py-3 border border-border rounded-lg bg-input text-foreground text-sm font-medium">
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
            <Button className="w-full py-3" onClick={sendOtp}>
              Continue
            </Button>
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
                  className="w-12 h-12 text-center text-lg font-bold"
                  placeholder="0"
                />
              ))}
            </div>

            <div className="text-center text-sm mb-4 text-muted-foreground">
              {timer > 0 ? (
                <>Gửi lại mã sau <b>{timer}</b>s</>
              ) : (
                <button className="text-primary font-semibold" onClick={sendOtp}>
                  Gửi lại mã
                </button>
              )}
            </div>

            <Button className="w-full py-3" onClick={verifyOTP}>
              Verify
            </Button>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.6s ease-out; }
      `}</style>
    </div>
  )
}
