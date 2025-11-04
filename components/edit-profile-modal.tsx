"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"

export type User = {
  id: number | string
  phoneNumber?: string
  name?: string
  avatar?: string
  createdAt?: string
  lastLogin?: string
}

interface EditProfileModalProps {
  user: User
  apiBase: string
  onClose: () => void
  onSaved: (updated: User) => void
}

export function EditProfileModal({ user, apiBase, onClose, onSaved }: EditProfileModalProps) {
  const [name, setName] = useState(user.name || "")
  const [avatar, setAvatar] = useState(user.avatar || "")
  const [saving, setSaving] = useState(false)
  const uploadRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setAvatar(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Tên không được để trống!")
      return
    }

    setSaving(true)
    try {
      const updated: User = { ...user, name: name.trim(), avatar }

      await fetch(`${apiBase}/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      })

      localStorage.setItem("authUser", JSON.stringify(updated))
      localStorage.setItem("user", JSON.stringify(updated))

      onSaved(updated)
      onClose()
    } catch (e) {
      console.error(e)
      alert("Cập nhật thất bại!")
    }
    setSaving(false)
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260 }}
        className="bg-card rounded-xl w-full max-w-md p-6 space-y-4 shadow-lg"
      >
        <h3 className="font-semibold text-lg">Edit Profile</h3>

        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-muted">
            {avatar ? (
              <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No Avatar
              </div>
            )}
          </div>
          <div className="flex-1">
            <input ref={uploadRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
            <button className="text-sm underline" onClick={() => uploadRef.current?.click()}>
              Change Avatar
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Name</label>
          <input
            className="w-full border border-border rounded px-3 py-2 mt-1 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg font-medium"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            className="flex-1 border border-border py-2 rounded-lg"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
