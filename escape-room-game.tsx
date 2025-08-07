"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Clock, Package, Key, Search, Lock, Lightbulb } from "lucide-react"

interface Item {
  id: string
  name: string
  icon: React.ReactNode
  description: string
}

interface Clue {
  id: string
  text: string
  found: boolean
}

interface Room {
  id: number
  name: string
  description: string
  timeLimit: number
  requiredItems: string[]
  code?: string
}

const rooms: Room[] = [
  {
    id: 1,
    name: "The Study",
    description: "A mysterious study filled with books and secrets...",
    timeLimit: 300, // 5 minutes
    requiredItems: ["key", "code"],
    code: "1847",
  },
  {
    id: 2,
    name: "The Laboratory",
    description: "An abandoned laboratory with strange equipment...",
    timeLimit: 420, // 7 minutes
    requiredItems: ["vial", "formula", "keycard"],
    code: "SCIENCE",
  },
  {
    id: 3,
    name: "The Vault",
    description: "The final challenge - a high-security vault...",
    timeLimit: 600, // 10 minutes
    requiredItems: ["masterkey", "blueprint", "scanner"],
    code: "ESCAPE",
  },
]

export default function Component() {
  const [currentRoom, setCurrentRoom] = useState(0)
  const [inventory, setInventory] = useState<Item[]>([])
  const [clues, setClues] = useState<Clue[]>([])
  const [timeLeft, setTimeLeft] = useState(rooms[0].timeLimit)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [gameLost, setGameLost] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [dialogContent, setDialogContent] = useState({ title: "", content: "" })
  const [codeInput, setCodeInput] = useState("")
  const [showCodeDialog, setShowCodeDialog] = useState(false)

  // Timer effect
  useEffect(() => {
    if (gameStarted && !gameWon && !gameLost && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else if (timeLeft === 0 && !gameWon) {
      setGameLost(true)
    }
  }, [gameStarted, gameWon, gameLost, timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const addToInventory = (item: Item) => {
    if (!inventory.find((i) => i.id === item.id)) {
      setInventory((prev) => [...prev, item])
      showMessage("Item Found!", `You found: ${item.name}`)
    }
  }

  const addClue = (clue: Clue) => {
    setClues((prev) => {
      const existing = prev.find((c) => c.id === clue.id)
      if (!existing) {
        showMessage("Clue Discovered!", clue.text)
        return [...prev, { ...clue, found: true }]
      }
      return prev
    })
  }

  const showMessage = (title: string, content: string) => {
    setDialogContent({ title, content })
    setShowDialog(true)
  }

  const checkWinCondition = () => {
    const room = rooms[currentRoom]
    const hasAllItems = room.requiredItems.every((itemId) => inventory.some((item) => item.id === itemId))

    if (hasAllItems) {
      setShowCodeDialog(true)
    } else {
      showMessage(
        "Missing Items",
        `You need: ${room.requiredItems.filter((itemId) => !inventory.some((item) => item.id === itemId)).join(", ")}`,
      )
    }
  }

  const submitCode = () => {
    const room = rooms[currentRoom]
    if (codeInput.toUpperCase() === room.code?.toUpperCase()) {
      setShowCodeDialog(false)
      setCodeInput("")

      if (currentRoom === rooms.length - 1) {
        setGameWon(true)
      } else {
        // Move to next room
        setCurrentRoom((prev) => prev + 1)
        setTimeLeft(rooms[currentRoom + 1].timeLimit)
        setInventory([])
        setClues([])
        showMessage("Room Escaped!", `Moving to ${rooms[currentRoom + 1].name}...`)
      }
    } else {
      showMessage("Wrong Code", "The code is incorrect. Keep searching for clues!")
    }
  }

  const startGame = () => {
    setGameStarted(true)
    setCurrentRoom(0)
    setTimeLeft(rooms[0].timeLimit)
    setInventory([])
    setClues([])
    setGameWon(false)
    setGameLost(false)
  }

  const resetGame = () => {
    setGameStarted(false)
    setCurrentRoom(0)
    setTimeLeft(rooms[0].timeLimit)
    setInventory([])
    setClues([])
    setGameWon(false)
    setGameLost(false)
    setCodeInput("")
  }

  // Room-specific clickable areas and items
  const getRoomContent = () => {
    switch (currentRoom) {
      case 0: // The Study
        return (
          <div className="relative w-full h-96 bg-gradient-to-b from-amber-100 to-amber-200 rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-[url('/room1.png?height=400&width=600')] bg-cover bg-center opacity-80"></div>

            {/* Clickable areas */}
            <button
              className="absolute top-16 left-8 w-16 h-20 bg-transparent hover:bg-blue-200/30 rounded transition-colors"
              onClick={() =>
                addToInventory({
                  id: "key",
                  name: "Old Key",
                  icon: <Key className="w-4 h-4" />,
                  description: "An ornate brass key",
                })
              }
              title="Click the bookshelf"
            />

            <button
              className="absolute bottom-20 right-12 w-20 h-16 bg-transparent hover:bg-blue-200/30 rounded transition-colors"
              onClick={() =>
                addClue({
                  id: "desk-note",
                  text: "A note reads: 'The year the library was founded: 1847'",
                  found: false,
                })
              }
              title="Click the desk"
            />

            <button
              className="absolute top-8 right-16 w-12 h-12 bg-transparent hover:bg-blue-200/30 rounded-full transition-colors"
              onClick={() =>
                addClue({
                  id: "painting-clue",
                  text: "Behind the painting: 'When books and time align, the truth you'll find'",
                  found: false,
                })
              }
              title="Click the painting"
            />

            <button
              className="absolute bottom-8 left-1/2 w-16 h-8 bg-transparent hover:bg-blue-200/30 rounded transition-colors"
              onClick={() =>
                addToInventory({
                  id: "code",
                  name: "Code Fragment",
                  icon: <Search className="w-4 h-4" />,
                  description: "A piece of paper with numbers",
                })
              }
              title="Click the fireplace"
            />
          </div>
        )

      case 1: // The Laboratory
        return (
          <div className="relative w-full h-96 bg-gradient-to-b from-green-100 to-green-200 rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-[url('/room2.png?height=400&width=600')] bg-cover bg-center opacity-80"></div>

            <button
              className="absolute top-12 left-16 w-12 h-16 bg-transparent hover:bg-green-200/30 rounded transition-colors"
              onClick={() =>
                addToInventory({
                  id: "vial",
                  name: "Chemical Vial",
                  icon: <Package className="w-4 h-4" />,
                  description: "A vial containing a mysterious liquid",
                })
              }
              title="Click the lab equipment"
            />

            <button
              className="absolute bottom-16 center w-20 h-12 bg-transparent hover:bg-green-200/30 rounded transition-colors"
              onClick={() =>
                addClue({
                  id: "formula",
                  text: "Chemical formula on the board: H2SO4 + NaCl = SCIENCE",
                  found: false,
                })
              }
              title="Click the whiteboard"
            />

            <button
              className="absolute top-20 right-8 w-16 h-12 bg-transparent hover:bg-green-200/30 rounded transition-colors"
              onClick={() =>
                addToInventory({
                  id: "keycard",
                  name: "Access Keycard",
                  icon: <Key className="w-4 h-4" />,
                  description: "A security keycard",
                })
              }
              title="Click the computer"
            />

            <button
              className="absolute bottom-8 left-8 w-14 h-14 bg-transparent hover:bg-green-200/30 rounded transition-colors"
              onClick={() =>
                addToInventory({
                  id: "formula",
                  name: "Formula Notes",
                  icon: <Lightbulb className="w-4 h-4" />,
                  description: "Research notes with formulas",
                })
              }
              title="Click the cabinet"
            />
          </div>
        )

      case 2: // The Vault
        return (
          <div className="relative w-full h-96 bg-gradient-to-b from-gray-100 to-gray-300 rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-[url('/room3.png?height=400&width=600')] bg-cover bg-center opacity-80"></div>

            <button
              className="absolute top-16 left-1/4 w-16 h-20 bg-transparent hover:bg-gray-200/30 rounded transition-colors"
              onClick={() =>
                addToInventory({
                  id: "masterkey",
                  name: "Master Key",
                  icon: <Key className="w-4 h-4" />,
                  description: "The ultimate key",
                })
              }
              title="Click the security panel"
            />

            <button
              className="absolute bottom-20 right-16 w-20 h-16 bg-transparent hover:bg-gray-200/30 rounded transition-colors"
              onClick={() =>
                addToInventory({
                  id: "blueprint",
                  name: "Vault Blueprint",
                  icon: <Search className="w-4 h-4" />,
                  description: "Detailed vault schematics",
                })
              }
              title="Click the control desk"
            />

            <button
              className="absolute top-8 right-8 w-12 h-12 bg-transparent hover:bg-gray-200/30 rounded-full transition-colors"
              onClick={() =>
                addToInventory({
                  id: "scanner",
                  name: "Biometric Scanner",
                  icon: <Package className="w-4 h-4" />,
                  description: "A portable scanner device",
                })
              }
              title="Click the scanner"
            />

            <button
              className="absolute bottom-8 left-1/2 w-24 h-12 bg-transparent hover:bg-gray-200/30 rounded transition-colors"
              onClick={() =>
                addClue({
                  id: "final-clue",
                  text: "Final message: 'To ESCAPE, you must believe in yourself'",
                  found: false,
                })
              }
              title="Click the vault door"
            />
          </div>
        )

      default:
        return null
    }
  }

  if (!gameStarted) {
    return (
<div
  className="flex flex-col items-center justify-center min-h-screen text-white p-4"
  style={{
    backgroundImage: "url('/room2.png')",  
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  }}
>
        <Card className="w-full max-w-md bg-black/20 border-white/20 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">🔐 Escape Room</CardTitle>
            <p className="text-gray-300">Can you solve the puzzles and escape in time?</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-300">
              <p>• Click around each room to find items and clues</p>
              <p>• Collect required items to unlock the exit</p>
              <p>• Solve puzzles and enter codes to progress</p>
              <p>• Beat the timer to escape!</p>
            </div>
            <Button onClick={startGame} className="w-full" size="lg">
              Start Game
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameWon) {
    return (
<div
  className="flex flex-col items-center justify-center min-h-screen text-white p-4 bg-blend-color-burn bg-gradient-to-br from-green-500 to-blue-500"
  
>
        <Card className="w-full max-w-md bg-black/20 border-white/20 text-white text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">🎉 Congratulations!</CardTitle>
            <p className="text-gray-300">You escaped all rooms!</p>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Time remaining: {formatTime(timeLeft)}</p>
            <Button onClick={resetGame} className="w-full">
              Play Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameLost) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-500 to-orange-500 text-white p-4">
        <Card className="w-full max-w-md bg-black/20 border-white/20 text-white text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">⏰ Time's Up!</CardTitle>
            <p className="text-gray-300">You couldn't escape in time...</p>
          </CardHeader>
          <CardContent>
            <Button onClick={resetGame} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
<div
  className="min-h-screen p-4 text-white bg-blend-color-dodge bg-gradient-to-br from-gray-800 to-gray-900" 
>      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">{rooms[currentRoom].name}</h1>
            <p className="text-gray-300">{rooms[currentRoom].description}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </Badge>
            <Badge variant="outline" className="text-white border-white">
              Room {currentRoom + 1}/{rooms.length}
            </Badge>
          </div>
        </div>

        {/* Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Room View */}
          <div className="lg:col-span-2">
            <Card className="bg-black/20 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Room View</CardTitle>
                <p className="text-gray-300 text-sm">Click on objects to interact with them</p>
              </CardHeader>
              <CardContent>{getRoomContent()}</CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Inventory */}
            <Card className="bg-black/20 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Inventory ({inventory.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {inventory.length === 0 ? (
                    <p className="text-gray-400 text-sm">No items found yet...</p>
                  ) : (
                    inventory.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 p-2 bg-white/10 rounded">
                        {item.icon}
                        <div>
                          <p className="text-sm font-medium text-white">{item.name}</p>
                          <p className="text-xs text-gray-300">{item.description}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Clues */}
            <Card className="bg-black/20 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Clues ({clues.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {clues.length === 0 ? (
                    <p className="text-gray-400 text-sm">No clues discovered yet...</p>
                  ) : (
                    clues.map((clue) => (
                      <div key={clue.id} className="p-2 bg-yellow-500/20 rounded border border-yellow-500/30">
                        <p className="text-sm text-white">{clue.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Escape Button */}
            <Button onClick={checkWinCondition} className="w-full bg-red-600 hover:bg-red-700" size="lg">
              <Lock className="w-4 h-4 mr-2" />
              Try to Escape
            </Button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>{dialogContent.title}</DialogTitle>
          </DialogHeader>
          <p>{dialogContent.content}</p>
        </DialogContent>
      </Dialog>

      <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Enter Exit Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>You have all the required items! Enter the code to escape this room.</p>
            <Input
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="Enter code..."
              className="bg-gray-800 border-gray-600 text-white"
            />
            <div className="flex gap-2">
              <Button onClick={submitCode} className="flex-1">
                Submit Code
              </Button>
              <Button variant="outline" onClick={() => setShowCodeDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
