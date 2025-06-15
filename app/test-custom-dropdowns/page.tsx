'use client'

import { useState } from 'react'
import { CustomDropdown } from '@/app/components/ui/CustomDropdown'
import { CustomContextMenu, CustomContextMenuItem } from '@/app/components/ui/CustomContextMenu'
import { Button } from '@/components/ui/button'
import { MoreVertical, Copy, Trash, Edit, Share } from 'lucide-react'
import '@/app/styles/magical-theme.css'

export default function TestCustomDropdowns() {
  const [theme, setTheme] = useState('modern')
  const [sortBy, setSortBy] = useState('date')
  const [language, setLanguage] = useState('en')

  return (
    <div className="min-h-screen page-gradient p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 shimmer-text">Custom Dropdown Components</h1>
          <p className="text-gray-400">Golden Wizardry themed dropdowns that appear below triggers</p>
        </div>

        {/* Standard Dropdowns */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-yellow-500">Standard Dropdowns</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Visual Theme Dropdown */}
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Visual Theme</label>
              <CustomDropdown
                value={theme}
                onValueChange={setTheme}
                options={[
                  { value: 'modern', label: 'Modern' },
                  { value: 'minimal', label: 'Minimal' },
                  { value: 'bold', label: 'Bold' },
                  { value: 'retro', label: 'Retro' },
                  { value: 'elegant', label: 'Elegant' },
                  { value: 'tech', label: 'Tech/Futuristic' },
                  { value: 'playful', label: 'Playful/Colorful' }
                ]}
                placeholder="Select theme..."
                width="100%"
              />
              <p className="text-xs text-gray-500">Selected: {theme}</p>
            </div>

            {/* Sort By Dropdown */}
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Sort By</label>
              <CustomDropdown
                value={sortBy}
                onValueChange={setSortBy}
                options={[
                  { value: 'name', label: 'Name' },
                  { value: 'date', label: 'Last Modified' },
                  { value: 'size', label: 'File Size' },
                  { value: 'type', label: 'File Type' }
                ]}
                placeholder="Sort by..."
                width="100%"
              />
              <p className="text-xs text-gray-500">Selected: {sortBy}</p>
            </div>

            {/* Language Dropdown */}
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Language</label>
              <CustomDropdown
                value={language}
                onValueChange={setLanguage}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'es', label: 'Spanish' },
                  { value: 'fr', label: 'French' },
                  { value: 'de', label: 'German' },
                  { value: 'it', label: 'Italian' },
                  { value: 'pt', label: 'Portuguese' },
                  { value: 'ja', label: 'Japanese' },
                  { value: 'ko', label: 'Korean' }
                ]}
                placeholder="Select language..."
                width="100%"
              />
              <p className="text-xs text-gray-500">Selected: {language}</p>
            </div>
          </div>
        </div>

        {/* Context Menus */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-yellow-500">Context Menus</h2>
          
          <div className="flex gap-4 items-center">
            {/* Icon Context Menu */}
            <CustomContextMenu
              trigger={
                <Button variant="ghost" size="icon" className="hover:bg-yellow-600/10">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              }
            >
              <CustomContextMenuItem onClick={() => console.log('Edit clicked')}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Item
              </CustomContextMenuItem>
              <CustomContextMenuItem onClick={() => console.log('Copy clicked')}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Item
              </CustomContextMenuItem>
              <CustomContextMenuItem onClick={() => console.log('Share clicked')}>
                <Share className="h-4 w-4 mr-2" />
                Share Item
              </CustomContextMenuItem>
              <CustomContextMenuItem 
                onClick={() => console.log('Delete clicked')}
                className="hover:text-red-400"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete Item
              </CustomContextMenuItem>
            </CustomContextMenu>

            {/* Button Context Menu */}
            <CustomContextMenu
              trigger={
                <Button variant="outline" className="btn-magical">
                  Actions Menu
                </Button>
              }
              align="start"
            >
              <CustomContextMenuItem onClick={() => console.log('Action 1')}>
                Action 1
              </CustomContextMenuItem>
              <CustomContextMenuItem onClick={() => console.log('Action 2')}>
                Action 2
              </CustomContextMenuItem>
              <CustomContextMenuItem onClick={() => console.log('Action 3')} disabled>
                Action 3 (Disabled)
              </CustomContextMenuItem>
            </CustomContextMenu>
          </div>
        </div>

        {/* Features */}
        <div className="card-magical p-6 space-y-4">
          <h2 className="text-xl font-semibold text-yellow-500">Features</h2>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start">
              <span className="text-yellow-500 mr-2">✨</span>
              <span>Dropdowns appear directly below triggers (no top positioning)</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-500 mr-2">✨</span>
              <span>Golden Wizardry theme with magical glow effects</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-500 mr-2">✨</span>
              <span>Click outside or ESC key to close</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-500 mr-2">✨</span>
              <span>Smooth animations and transitions</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-500 mr-2">✨</span>
              <span>Proper state management</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-500 mr-2">✨</span>
              <span>Viewport boundary detection</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-500 mr-2">✨</span>
              <span>Accessible keyboard navigation</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}