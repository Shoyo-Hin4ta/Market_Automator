'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import '@/app/styles/magical-theme.css'

export default function TestDropdownPage() {
  return (
    <div className="min-h-screen page-gradient p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white mb-8">Dropdown Position Test</h1>
        
        {/* Test Dropdown Menu */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Dropdown Menu</h2>
          <div className="flex gap-4 items-start">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="btn-magical">
                  Open Dropdown
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="btn-magical">
                  Another Dropdown
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Option 1</DropdownMenuItem>
                <DropdownMenuItem>Option 2</DropdownMenuItem>
                <DropdownMenuItem>Option 3</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Test Select */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Select Component</h2>
          <div className="flex gap-4">
            <Select>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
              </SelectContent>
            </Select>
            
            <Select>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Another select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="cherry">Cherry</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Test at different scroll positions */}
        <div className="mt-32 space-y-4">
          <h2 className="text-xl font-semibold text-white">Scroll Position Test</h2>
          <p className="text-gray-300">These dropdowns should still appear below their triggers even when scrolled</p>
          <div className="flex gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="btn-magical">
                  Scrolled Dropdown
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Item 1</DropdownMenuItem>
                <DropdownMenuItem>Item 2</DropdownMenuItem>
                <DropdownMenuItem>Item 3</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Select>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Scrolled select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="item1">Item 1</SelectItem>
                <SelectItem value="item2">Item 2</SelectItem>
                <SelectItem value="item3">Item 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Add some space for scrolling */}
        <div className="h-96" />
      </div>
    </div>
  )
}