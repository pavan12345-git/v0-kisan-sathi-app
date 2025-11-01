"use client"

import type React from "react"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"

interface BilingualText {
  en: string
  kn: string
}

interface BilingualList {
  en: string[]
  kn: string[]
}

interface DiseaseResult {
  disease: BilingualText
  confidence: number
  severity: "low" | "medium" | "high"
  cause: BilingualText
  treatment: {
    immediate: BilingualList
    chemical: BilingualList
    organic: BilingualList
  }
  prevention: BilingualList
}

type ImageStatus = "idle" | "compressing" | "ready" | "analyzing" | "done" | "error"

interface UploadItem {
  id: string
  name: string
  originalSrc: string
  src: string
  status: ImageStatus
  progress: number
  result?: DiseaseResult
  errorMessage?: string
}

function CropDoctorContent() {
  const [items, setItems] = useState<UploadItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [compareIds, setCompareIds] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement | null>(null)
  const cameraInputRef = useRef<HTMLInputElement | null>(null)
  const [cropType, setCropType] = useState<string>("")
  const [customCrop, setCustomCrop] = useState<string>("")
  const [history, setHistory] = useState<any[]>([])
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000"
  const [analysisId, setAnalysisId] = useState<number | null>(null)
  const [language, setLanguage] = useState<"en" | "kn">("en")

  const canAddMore = items.length < 5
  const canAnalyze = useMemo(() => items.some((i) => i.status === "ready" || i.status === "idle"), [items])
  const analyzedItems = items.filter((i) => i.status === "done")

  const generateId = () => Math.random().toString(36).slice(2)

  const compressImage = (file: File, maxSize = 1200, quality = 0.75): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement("canvas")
          let { width, height } = img
          const scale = Math.min(1, maxSize / Math.max(width, height))
          width = Math.round(width * scale)
          height = Math.round(height * scale)
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext("2d")
          if (!ctx) return reject(new Error("Canvas context not available"))
          ctx.drawImage(img, 0, 0, width, height)
          const dataUrl = canvas.toDataURL("image/jpeg", quality)
          resolve(dataUrl)
        }
        img.onerror = () => reject(new Error("Failed to load image for compression"))
        img.src = reader.result as string
      }
      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsDataURL(file)
    })
  }

  const addFiles = useCallback(async (files: FileList | File[]) => {
    if (!files || files.length === 0) return
    const remainingSlots = 5 - items.length
    const list = Array.from(files).slice(0, Math.max(0, remainingSlots))
    if (list.length === 0) return

    // Seed items in compressing state for instant UI feedback
    const seeded: UploadItem[] = await Promise.all(
      list.map(async (file) => {
        const tempSrc = URL.createObjectURL(file)
        return {
          id: generateId(),
          name: file.name,
          originalSrc: tempSrc,
          src: tempSrc,
          status: "compressing",
          progress: 0,
        }
      })
    )
    setItems((prev) => [...prev, ...seeded])

    // Compress in background and update each item
    await Promise.all(
      list.map(async (file, index) => {
        const itemId = seeded[index].id
        try {
          const compressed = await compressImage(file)
          setItems((prev) =>
            prev.map((it) => (it.id === itemId ? { ...it, src: compressed, status: "ready", progress: 0 } : it))
          )
        } catch (err) {
          setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, status: "error", errorMessage: "Compression failed" } : it)))
        }
      })
    )
  }, [items.length])

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files)
    // reset to allow re-selecting the same files
    if (inputRef.current) inputRef.current.value = ""
  }

  const onCameraInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files)
    if (cameraInputRef.current) cameraInputRef.current.value = ""
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const onDragLeave = () => setIsDragging(false)
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (!canAddMore) return
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      addFiles(e.dataTransfer.files)
    }
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
    setCompareIds((prev) => prev.filter((cid) => cid !== id))
  }

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 2) return [prev[1], id]
      return [...prev, id]
    })
  }

  const analyzeAll = async () => {
    const queue = items.filter((i) => i.status === "ready" || i.status === "idle")
    if (queue.length === 0) return
    // mark all queued as analyzing
    setItems((prev) => prev.map((i) => (queue.find((q) => q.id === i.id) ? { ...i, status: "analyzing", progress: 10 } : i)))
    const form = new FormData()
    const selectedCrop = cropType === "__custom__" ? customCrop.trim() : cropType
    form.append("crop_type", selectedCrop)
    form.append("language", language)
    // append images in the same order as items
    for (const it of queue) {
      // convert dataURL to blob
      const res = await fetch(it.src)
      const blob = await res.blob()
      form.append("images", blob, it.name || `image_${it.id}.jpg`)
    }
    try {
      const resp = await fetch(`${API_BASE}/api/crop-doctor/analyze/`, {
        method: "POST",
        body: form,
      })
      if (!resp.ok) throw new Error("Analyze failed")
      const json = await resp.json()
      if (!json.success) throw new Error(json.message || "Analyze failed")
      const analysis = json.analysis
      setAnalysisId(analysis.id)
      const results: DiseaseResult[] = (analysis.result?.items || [])
      // Assign results in order to queued items
      setItems((prev) => {
        const next = [...prev]
        let rIndex = 0
        for (let i = 0; i < next.length; i++) {
          if (queue.find((q) => q.id === next[i].id)) {
            const r = results[rIndex]
            next[i] = { ...next[i], status: "done", progress: 100, result: r }
            rIndex++
          }
        }
        return next
      })
    } catch (e) {
      setItems((prev) => prev.map((i) => (queue.find((q) => q.id === i.id) ? { ...i, status: "error", errorMessage: "Analysis failed" } : i)))
    }
  }

  // Simple image editing helpers
  const rotateImage = (dataUrl: string, degrees: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) return reject(new Error("Canvas context not available"))
        const radians = (degrees * Math.PI) / 180
        const sin = Math.abs(Math.sin(radians))
        const cos = Math.abs(Math.cos(radians))
        const newWidth = Math.round(img.width * cos + img.height * sin)
        const newHeight = Math.round(img.width * sin + img.height * cos)
        canvas.width = newWidth
        canvas.height = newHeight
        ctx.translate(newWidth / 2, newHeight / 2)
        ctx.rotate(radians)
        ctx.drawImage(img, -img.width / 2, -img.height / 2)
        resolve(canvas.toDataURL("image/jpeg", 0.9))
      }
      img.onerror = () => reject(new Error("Failed to rotate image"))
      img.src = dataUrl
    })
  }

  const cropCenterSquare = (dataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const size = Math.min(img.width, img.height)
        const sx = Math.floor((img.width - size) / 2)
        const sy = Math.floor((img.height - size) / 2)
        const canvas = document.createElement("canvas")
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext("2d")
        if (!ctx) return reject(new Error("Canvas context not available"))
        ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size)
        resolve(canvas.toDataURL("image/jpeg", 0.9))
      }
      img.onerror = () => reject(new Error("Failed to crop image"))
      img.src = dataUrl
    })
  }

  const editRotate = async (id: string) => {
    const it = items.find((x) => x.id === id)
    if (!it) return
    const rotated = await rotateImage(it.src, 90)
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, src: rotated } : x)))
  }

  const editCrop = async (id: string) => {
    const it = items.find((x) => x.id === id)
    if (!it) return
    const cropped = await cropCenterSquare(it.src)
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, src: cropped } : x)))
  }

  // Kannada TTS for treatment
  const speakText = (text: string, lang = "kn-IN") => {
    try {
      if (!("speechSynthesis" in window)) return
      const utter = new SpeechSynthesisUtterance(text)
      utter.lang = lang
      const voices = window.speechSynthesis.getVoices()
      const knVoice = voices.find((v) => v.lang?.toLowerCase().startsWith("kn"))
      if (knVoice) utter.voice = knVoice
      window.speechSynthesis.speak(utter)
    } catch {}
  }

  // History in localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("cropDoctorHistory")
      if (raw) setHistory(JSON.parse(raw))
    } catch {}
  }, [])

  const saveToHistory = (it: UploadItem) => {
    if (!it.result) return
    const selectedCrop = cropType === "__custom__" ? customCrop.trim() : cropType
    const entry = {
      id: it.id,
      name: it.name,
      src: it.src,
      cropType: selectedCrop || "",
      result: it.result,
      savedAt: Date.now(),
    }
    const next = [entry, ...history].slice(0, 50)
    setHistory(next)
    try {
      localStorage.setItem("cropDoctorHistory", JSON.stringify(next))
    } catch {}
  }

  return (
    <>
      <DashboardHeader />
      <DashboardNav />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">AI Crop Doctor</h2>
        <p className="text-muted-foreground mb-8">
          Upload a photo of your crop to identify diseases and get treatment advice
        </p>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div>
            <Card className="p-8">
              <h3 className="text-xl font-bold text-foreground mb-6">Upload Crop Images</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-foreground">Select Crop Type</label>
                <select
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="w-full border rounded px-3 py-2 bg-background text-foreground"
                >
                  <option value="">Choose crop (improves accuracy)</option>
                  <option value="Tomato">Tomato</option>
                  <option value="Potato">Potato</option>
                  <option value="Rice">Rice</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Maize">Maize</option>
                  <option value="Cotton">Cotton</option>
                  <option value="__custom__">Other (type manually)</option>
                </select>
                {cropType === "__custom__" && (
                  <input
                    type="text"
                    value={customCrop}
                    onChange={(e) => setCustomCrop(e.target.value)}
                    placeholder="Enter crop name"
                    className="mt-2 w-full border rounded px-3 py-2 bg-background text-foreground"
                  />)
                }
                <div className="mt-2 flex items-center gap-2">
                  <label className="text-sm text-foreground">Result Language</label>
                  <select value={language} onChange={(e) => setLanguage(e.target.value as any)} className="border rounded px-2 py-1 bg-background text-foreground">
                    <option value="en">English</option>
                    <option value="kn">Kannada</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragging ? "border-primary bg-muted" : "border-border"
                  } ${canAddMore ? "cursor-pointer" : "opacity-60 cursor-not-allowed"}`}
                  onClick={() => canAddMore && inputRef.current?.click()}
                >
                  <div className="text-4xl mb-2">📸</div>
                  <p className="font-semibold text-foreground mb-1">Drag & drop or click to upload</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG • up to 5 images</p>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onInputChange}
                    className="hidden"
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={onCameraInputChange}
                    className="hidden"
                  />
                </div>
              </div>

              {items.length > 0 && (
                <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {items.map((it) => (
                    <div key={it.id} className="relative">
                      <img
                        src={it.src || "/placeholder.svg"}
                        alt={it.name}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <div className="absolute inset-x-0 bottom-0">
                        {(it.status === "analyzing" || (it.progress > 0 && it.progress < 100)) && (
                          <div className="h-1 w-full bg-muted rounded-b-lg overflow-hidden">
                            <div
                              className="h-1 bg-primary"
                              style={{ width: `${it.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="absolute top-2 left-2 flex gap-1">
                        {it.status === "done" && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-600 text-white">Done</span>
                        )}
                        {it.status === "compressing" && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-600 text-white">Compressing</span>
                        )}
                        {it.status === "analyzing" && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-600 text-white">Analyzing</span>
                        )}
                      </div>
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => editRotate(it.id)}>
                          Rotate
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => editCrop(it.id)}>
                          Crop
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => removeItem(it.id)}>
                          Delete
                        </Button>
                      </div>
                      {it.status === "done" && (
                        <div className="absolute bottom-2 right-2 flex gap-2">
                          <Button variant="secondary" size="sm" onClick={() => toggleCompare(it.id)}>
                            {compareIds.includes(it.id) ? "Selected" : "Compare"}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={analyzeAll} disabled={!canAnalyze} className="h-12 text-base font-semibold flex-1">
                  Analyze All
                </Button>
                <Button
                  variant="outline"
                  onClick={() => inputRef.current?.click()}
                  disabled={!canAddMore}
                  className="h-12 text-base font-semibold"
                >
                  Add More
                </Button>
                <Button
                  variant="outline"
                  onClick={() => cameraInputRef.current?.click()}
                  className="h-12 text-base font-semibold"
                >
                  Take Photo
                </Button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm text-foreground">
                  <strong>Tip:</strong> Clear, close-up images of affected areas improve accuracy.
                </p>
              </div>
            </Card>
          </div>

          {/* Results Section */}
          <div>
            {analyzedItems.length > 0 ? (
              <div className="space-y-6">
                {/* Compare Area */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-foreground">Compare Images</h4>
                    <span className="text-sm text-muted-foreground">Select up to 2 analyzed images</span>
                  </div>
                  {compareIds.length === 2 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {compareIds.map((id) => {
                        const it = items.find((x) => x.id === id)
                        if (!it || !it.result) return null
                        return (
                          <div key={id} className="border rounded-lg p-3">
                            <img src={it.src} alt={it.name} className="w-full h-48 object-cover rounded" />
                            <div className="mt-3">
                              <div className="flex items-center justify-between">
                                <h5 className="font-semibold text-foreground">{it.result.disease.en}</h5>
                                <span className="text-sm text-muted-foreground">{it.result.confidence}%</span>
                              </div>
                              <span
                                className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  it.result.severity === "high"
                                    ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                    : it.result.severity === "medium"
                                      ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                                      : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                }`}
                              >
                                {it.result.severity.charAt(0).toUpperCase() + it.result.severity.slice(1)} Severity
                              </span>
                              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{it.result.cause.en}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Choose two results from the list below to compare.</p>
                  )}
                </Card>

                {/* Results List */}
                <div className="grid xl:grid-cols-2 gap-6">
                  {analyzedItems.map((it) => (
                    <Card key={it.id} className="p-6">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <img src={it.src} alt={it.name} className="w-full h-48 object-cover rounded" />
                        <div>
                          {it.result && (
                            <>
                              <div className="flex items-center gap-3 mb-2">
                                <div className="text-2xl">🔬</div>
                                <div>
                                  <h3 className="text-xl font-bold text-foreground">{it.result.disease.en}</h3>
                                  <p className="text-muted-foreground">Confidence: {it.result.confidence}%</p>
                                </div>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  it.result.severity === "high"
                                    ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                    : it.result.severity === "medium"
                                      ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                                      : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                }`}
                              >
                                {it.result.severity.charAt(0).toUpperCase() + it.result.severity.slice(1)} Severity
                              </span>
                              <div className="mt-3">
                                <h4 className="font-semibold text-foreground mb-1">Cause</h4>
                                <p className="text-sm text-muted-foreground">{language === "kn" ? it.result.cause.kn : it.result.cause.en}</p>
                              </div>
                              <div className="mt-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold text-foreground mb-2">Recommended Treatment</h4>
                                  <div className="flex gap-2">
                                    <Button variant="secondary" size="sm" onClick={() => speakText((it.result.treatment.immediate[language] || []).concat(it.result.treatment.chemical[language] || [], it.result.treatment.organic[language] || []).join(". "), language === "kn" ? "kn-IN" : "en-US")}>🔊 {language.toUpperCase()}</Button>
                                    <Button variant="outline" size="sm" onClick={() => speakText((it.result.treatment.immediate.en || []).concat(it.result.treatment.chemical.en || [], it.result.treatment.organic.en || []).join(". "), "en-US")}>🔊 EN</Button>
                                  </div>
                                </div>
                                <div className="text-sm text-foreground">
                                  <div className="font-semibold mt-2">Immediate</div>
                                  <ul className="list-disc ml-5">
                                    {(language === "kn" ? it.result.treatment.immediate.kn : it.result.treatment.immediate.en).map((t, idx) => (<li key={"im"+idx}>{t}</li>))}
                                  </ul>
                                  <div className="font-semibold mt-2">Chemical</div>
                                  <ul className="list-disc ml-5">
                                    {(language === "kn" ? it.result.treatment.chemical.kn : it.result.treatment.chemical.en).map((t, idx) => (<li key={"ch"+idx}>{t}</li>))}
                                  </ul>
                                  <div className="font-semibold mt-2">Organic</div>
                                  <ul className="list-disc ml-5">
                                    {(language === "kn" ? it.result.treatment.organic.kn : it.result.treatment.organic.en).map((t, idx) => (<li key={"or"+idx}>{t}</li>))}
                                  </ul>
                                </div>
                              </div>
                              <div className="mt-3">
                                <h4 className="font-semibold text-foreground mb-2">Prevention</h4>
                                <ul className="list-disc ml-5 text-sm text-foreground">
                                  {(language === "kn" ? it.result.prevention.kn : it.result.prevention.en).map((p, idx) => (<li key={"pr"+idx}>{p}</li>))}
                                </ul>
                              </div>
                              <div className="mt-4 flex gap-2">
                                <Button variant="outline" onClick={() => toggleCompare(it.id)}>
                                  {compareIds.includes(it.id) ? "Remove from Compare" : "Add to Compare"}
                                </Button>
                                <Button onClick={() => saveToHistory(it)}>Save Report</Button>
                                {analysisId && (
                                  <a href={`${API_BASE}/api/crop-doctor/report/${analysisId}/`} target="_blank" rel="noreferrer" className="inline-flex"><Button>Download PDF</Button></a>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Nearby Centers */}
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-foreground">Nearby Centers</h4>
                    <span className="text-sm text-muted-foreground">Help is close by</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {[{ name: "Krishi Vigyan Kendra", distance: "5.2 km", phone: "08012345678" }, { name: "Agriculture Department Office", distance: "8.7 km", phone: "08087654321" }].map((c, i) => (
                      <div key={i} className="flex items-center justify-between border rounded p-3">
                        <div>
                          <p className="font-semibold text-foreground">{c.name}</p>
                          <p className="text-sm text-muted-foreground">📍 {c.distance} away</p>
                        </div>
                        <div className="flex gap-2">
                          <a href={`tel:${c.phone}`} className="inline-flex"><Button variant="outline">Call</Button></a>
                          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.name)}`} target="_blank" rel="noreferrer" className="inline-flex"><Button>Directions</Button></a>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* History */}
                {history.length > 0 && (
                  <Card className="p-6">
                    <h4 className="text-lg font-semibold text-foreground mb-4">My History</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      {history.map((h) => (
                        <div key={h.id} className="border rounded-lg overflow-hidden">
                          <img src={h.src} alt={h.name} className="w-full h-32 object-cover" />
                          <div className="p-3">
                            <p className="text-sm text-muted-foreground">{new Date(h.savedAt).toLocaleString()}</p>
                            <p className="font-semibold text-foreground mt-1">{h.result?.disease}</p>
                            <div className="mt-2 flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => speakText(h.result?.treatment?.join(". ") || "")}>🔊</Button>
                              <Button size="sm" onClick={() => window.print()}>Download</Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <div className="text-6xl mb-4">🌾</div>
                <p className="text-muted-foreground">Upload images and run analysis to see results here</p>
              </Card>
            )}
          </div>
        </div>

        {/* Recent Analyses */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-foreground mb-4">Recent Analyses</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { disease: "Powdery Mildew", date: "2 days ago", status: "Treated" },
              { disease: "Leaf Spot", date: "1 week ago", status: "Monitoring" },
              { disease: "Rust", date: "2 weeks ago", status: "Resolved" },
            ].map((item, idx) => (
              <Card key={idx} className="p-4">
                <p className="font-semibold text-foreground mb-1">{item.disease}</p>
                <p className="text-sm text-muted-foreground mb-3">{item.date}</p>
                <span className="text-xs px-2 py-1 bg-muted rounded-full text-foreground">{item.status}</span>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}

export default function CropDoctorPage() {
  return (
    <ProtectedRoute>
      <CropDoctorContent />
    </ProtectedRoute>
  )
}
