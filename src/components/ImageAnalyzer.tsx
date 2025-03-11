import React, { useState, useRef, useEffect } from 'react'
import { processImage } from '@/core/main'
import { setSplittingMode, getSplittingMode } from '@/core/config'
import { DetectionMethod } from '@/core/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Loader2, Upload, Image as ImageIcon, FileText, X } from 'lucide-react'

interface ImageAnalyzerProps {
  onAnalysisComplete?: (result: any) => void
  maxComponents?: number
}

export const ImageAnalyzer: React.FC<ImageAnalyzerProps> = ({ onAnalysisComplete, maxComponents = 6 }) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const clearImage = () => {
    setImage(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    toast.success('Image removed')
  }

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        setImage(img)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    if (image && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        canvas.width = image.width
        canvas.height = image.height
        ctx.drawImage(image, 0, 0)
      }
      toast.success('Image uploaded successfully')
    }
  }, [image])

  // Analyze current image
  const analyzeImage = async () => {
    if (!image) {
      setError('Please upload an image first')
      toast.error('Please upload an image first')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      // Set default LLM detection method
      setSplittingMode('llm')

      // Process image
      const analysisResult = await processImage(image, undefined, maxComponents)
      setResult(analysisResult)

      // Notify parent component
      if (onAnalysisComplete) {
        onAnalysisComplete(analysisResult)
      }

      toast.success('Image analysis complete')
    } catch (err) {
      console.error('Error analyzing image:', err)
      const errorMessage = `Error during analysis: ${err instanceof Error ? err.message : String(err)}`
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
        <div className="bg-muted rounded-lg p-4 flex flex-col items-center justify-center border border-border min-h-[300px] relative">
          {image ? (
            <div className="relative w-full group">
              <div className="overflow-auto max-h-[500px] w-full flex items-center justify-center">
                <canvas ref={canvasRef} className="max-w-full h-auto object-contain border border-border rounded-md shadow-sm" style={{ maxHeight: '500px' }} />
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-md">
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-full p-2 h-10 w-10 bg-white/80 hover:bg-destructive hover:text-destructive-foreground transition-colors duration-200"
                  onClick={clearImage}
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Remove image</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8">
              <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No image selected</h3>
              <p className="text-sm text-muted-foreground mt-2 mb-4">Supports JPG, PNG and other common image formats</p>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Select Image
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card className="h-full flex flex-col items-center justify-center">
            <CardHeader className="pb-3"></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Upload Image</label>
                <div className="flex gap-2">
                  <Input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} className="hidden" />
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    Browse...
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={analyzeImage} disabled={isAnalyzing || !image} className="w-full">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Analyze Image
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardHeader className="pb-2">
            <CardTitle className="text-destructive text-lg">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="main">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="main">Main Design</TabsTrigger>
                <TabsTrigger value="components">Component Analysis</TabsTrigger>
                <TabsTrigger value="final">Final Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="main" className="space-y-2">
                <h4 className="text-lg font-medium">Main Design</h4>
                <div className="bg-muted rounded-md p-3">
                  <pre className="whitespace-pre-wrap text-sm">{result.mainDesign}</pre>
                </div>
              </TabsContent>

              <TabsContent value="components">
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">Component Analysis</h4>
                  {result.componentAnalyses.map((analysis: string, index: number) => (
                    <Card key={index} className="border-muted">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-md">Component {index + 1}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted/50 rounded-md p-3">
                          <pre className="whitespace-pre-wrap text-sm">{analysis}</pre>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="final" className="space-y-2">
                <h4 className="text-lg font-medium">Final Analysis</h4>
                <div className="bg-muted rounded-md p-3">
                  <pre className="whitespace-pre-wrap text-sm">{result.finalAnalysis}</pre>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
