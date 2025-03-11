import React from 'react'
import { ConfigOptions } from './core/types'
import { Toaster } from '@/components/ui/sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings } from '@/components/Settings'
import { ImageAnalyzer } from '@/components/ImageAnalyzer'

function App() {
  const handleAnalysisComplete = (result: any) => {
    console.log('Analysis complete:', result)
  }

  const handleConfigChange = (config: ConfigOptions) => {
    console.log('Configuration changed:', config)
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col items-center">
      <Toaster position="top-right" />

      <main className="container max-w-5xl mx-auto space-y-6">
        <header className="text-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">UI Screenshot to Prompt Generator</h1>
          <p className="text-muted-foreground mt-2">Upload UI screenshots and generate detailed analysis</p>
        </header>

        <Tabs defaultValue="analyze" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="analyze">Image Analysis</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="analyze">
            <Card>
              <CardHeader>
                <CardTitle>Image Analysis</CardTitle>
                <CardDescription>Upload UI screenshots for intelligent analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ImageAnalyzer onAnalysisComplete={handleAnalysisComplete} maxComponents={6} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Settings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default App
