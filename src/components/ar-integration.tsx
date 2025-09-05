'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { 
  Camera, 
  Box, 
  Ruler, 
  Layers, 
  Zap,
  RotateCcw,
  Download,
  Share2,
  Maximize2,
  Minimize2,
  Grid3X3,
  Home,
  Building2,
  TreePine,
  Car,
  Move3D,
  Scan,
  Smartphone,
  Tablet,
  Monitor,
  Upload,
  FileText,
  Image as ImageIcon,
  Video,
  Calculator
} from 'lucide-react'

interface Measurement {
  id: string
  name: string
  type: 'length' | 'area' | 'volume' | 'angle'
  value: number
  unit: string
  date: string
  project: string
  accuracy: number
}

interface Model {
  id: string
  name: string
  type: '3d' | 'floorplan' | 'elevation'
  size: string
  date: string
  project: string
  vertices: number
  faces: number
  preview: string
}

interface Project {
  id: string
  name: string
  location: string
  type: string
  status: 'scanning' | 'processing' | 'completed'
  progress: number
  lastUpdated: string
}

export default function ARIntegration() {
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [activeTab, setActiveTab] = useState('scanner')
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [selectedTool, setSelectedTool] = useState('measure')
  const [cameraMode, setCameraMode] = useState('photo')
  const videoRef = useRef<HTMLVideoElement>(null)

  // Demo veri
  const demoMeasurements: Measurement[] = [
    {
      id: '1',
      name: 'Oda Alanı',
      type: 'area',
      value: 25.5,
      unit: 'm²',
      date: '2024-03-15',
      project: 'Villa Projesi',
      accuracy: 98
    },
    {
      id: '2',
      name: 'Duvar Yüksekliği',
      type: 'length',
      value: 3.2,
      unit: 'm',
      date: '2024-03-15',
      project: 'Villa Projesi',
      accuracy: 99
    },
    {
      id: '3',
      name: 'Oda Hacmi',
      type: 'volume',
      value: 81.6,
      unit: 'm³',
      date: '2024-03-16',
      project: 'Villa Projesi',
      accuracy: 97
    }
  ]

  const demoModels: Model[] = [
    {
      id: '1',
      name: '3D Oda Modeli',
      type: '3d',
      size: '15.2 MB',
      date: '2024-03-15',
      project: 'Villa Projesi',
      vertices: 15420,
      faces: 8765,
      preview: '/api/placeholder/300/200'
    },
    {
      id: '2',
      name: 'Kat Planı',
      type: 'floorplan',
      size: '2.1 MB',
      date: '2024-03-15',
      project: 'Villa Projesi',
      vertices: 2340,
      faces: 1120,
      preview: '/api/placeholder/300/200'
    },
    {
      id: '3',
      name: 'Cephe Görünümü',
      type: 'elevation',
      size: '3.8 MB',
      date: '2024-03-16',
      project: 'Villa Projesi',
      vertices: 5430,
      faces: 2890,
      preview: '/api/placeholder/300/200'
    }
  ]

  const demoProjects: Project[] = [
    {
      id: '1',
      name: 'Villa Projesi',
      location: 'Ataşehir, İstanbul',
      type: 'Konut',
      status: 'completed',
      progress: 100,
      lastUpdated: '2024-03-16'
    },
    {
      id: '2',
      name: 'Ofis Restorasyon',
      location: 'Levent, İstanbul',
      type: 'Ticari',
      status: 'processing',
      progress: 65,
      lastUpdated: '2024-03-17'
    }
  ]

  useEffect(() => {
    setMeasurements(demoMeasurements)
    setModels(demoModels)
    setProjects(demoProjects)
  }, [])

  const startScanning = () => {
    setIsScanning(true)
    setScanProgress(0)
    
    // Simüle edilmiş scanning işlemi
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsScanning(false)
          return 100
        }
        return prev + 5
      })
    }, 200)
  }

  const stopScanning = () => {
    setIsScanning(false)
    setScanProgress(0)
  }

  const getMeasurementIcon = (type: string) => {
    switch (type) {
      case 'length': return <Ruler className="w-5 h-5" />
      case 'area': return <Grid3X3 className="w-5 h-5" />
      case 'volume': return <Box className="w-5 h-5" />
      case 'angle': return <RotateCcw className="w-5 h-5" />
      default: return <Calculator className="w-5 h-5" />
    }
  }

  const getModelIcon = (type: string) => {
    switch (type) {
      case '3d': return <Box className="w-5 h-5" />
      case 'floorplan': return <Home className="w-5 h-5" />
      case 'elevation': return <Building2 className="w-5 h-5" />
      default: return <Layers className="w-5 h-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'scanning': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const tools = [
    { id: 'measure', name: 'Ölçüm', icon: <Ruler className="w-5 h-5" /> },
    { id: 'area', name: 'Alan', icon: <Grid3X3 className="w-5 h-5" /> },
    { id: 'volume', name: 'Hacim', icon: <Box className="w-5 h-5" /> },
    { id: 'angle', name: 'Açı', icon: <RotateCcw className="w-5 h-5" /> }
  ]

  const cameraModes = [
    { id: 'photo', name: 'Fotoğraf', icon: <Camera className="w-5 h-5" /> },
    { id: 'video', name: 'Video', icon: <Video className="w-5 h-5" /> },
    { id: 'panorama', name: 'Panorama', icon: <Maximize2 className="w-5 h-5" /> }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-gradient">3D/AR Entegrasyon</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Polycam teknolojisi ile alan ölçümü ve simülasyon
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Toplam Ölçüm</p>
                  <p className="text-2xl font-bold">{measurements.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Ruler className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">3D Model</p>
                  <p className="text-2xl font-bold">{models.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Box className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aktif Proje</p>
                  <p className="text-2xl font-bold">{projects.filter(p => p.status !== 'completed').length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ortalama Doğruluk</p>
                  <p className="text-2xl font-bold">
                    {measurements.length > 0 
                      ? (measurements.reduce((sum, m) => sum + m.accuracy, 0) / measurements.length).toFixed(1)
                      : '0'}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
            <TabsTrigger value="scanner">Tarayıcı</TabsTrigger>
            <TabsTrigger value="measurements">Ölçümler</TabsTrigger>
            <TabsTrigger value="models">3D Modeller</TabsTrigger>
            <TabsTrigger value="projects">Projeler</TabsTrigger>
          </TabsList>

          <TabsContent value="scanner" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Scanner Controls */}
              <div className="lg:col-span-1 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tarama Ayarları</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Araç</label>
                      <div className="grid grid-cols-2 gap-2">
                        {tools.map(tool => (
                          <Button
                            key={tool.id}
                            variant={selectedTool === tool.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedTool(tool.id)}
                            className="flex flex-col items-center gap-1 h-auto py-3"
                          >
                            {tool.icon}
                            <span className="text-xs">{tool.name}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Kamera Modu</label>
                      <div className="grid grid-cols-3 gap-2">
                        {cameraModes.map(mode => (
                          <Button
                            key={mode.id}
                            variant={cameraMode === mode.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCameraMode(mode.id)}
                            className="flex flex-col items-center gap-1 h-auto py-3"
                          >
                            {mode.icon}
                            <span className="text-xs">{mode.name}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {isScanning ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Taranıyor...</span>
                            <span className="text-sm font-bold">{scanProgress}%</span>
                          </div>
                          <Progress value={scanProgress} className="h-2" />
                          <Button onClick={stopScanning} variant="destructive" className="w-full">
                            Durdur
                          </Button>
                        </div>
                      ) : (
                        <Button onClick={startScanning} className="w-full">
                          <Scan className="w-4 h-4 mr-2" />
                          Taramayı Başlat
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Hızlı Eylemler</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Upload className="w-4 h-4 mr-2" />
                      Model Yükle
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      Rapor Oluştur
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Share2 className="w-4 h-4 mr-2" />
                      Paylaş
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Scanner View */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>3D Tarayıcı</span>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Smartphone className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Tablet className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Monitor className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: '500px' }}>
                      {/* Simulated camera view */}
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium mb-2">3D Kamera Görünümü</p>
                          <p className="text-sm opacity-75">
                            {isScanning ? 'Tarama devam ediyor...' : 'Taramayı başlatmak için butona basın'}
                          </p>
                        </div>
                      </div>

                      {/* Overlay grid */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="grid grid-cols-3 grid-rows-3 h-full opacity-20">
                          {[...Array(9)].map((_, i) => (
                            <div key={i} className="border border-white"></div>
                          ))}
                        </div>
                      </div>

                      {/* Measurement points */}
                      <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      <div className="absolute bottom-1/3 left-1/2 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>

                      {/* Controls overlay */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4">
                          <div className="flex items-center justify-between text-white">
                            <div className="flex items-center gap-4">
                              <div className="text-sm">
                                <p className="font-medium">Seçili Araç</p>
                                <p className="text-xs opacity-75">{tools.find(t => t.id === selectedTool)?.name}</p>
                              </div>
                              <div className="text-sm">
                                <p className="font-medium">Mod</p>
                                <p className="text-xs opacity-75">{cameraModes.find(m => m.id === cameraMode)?.name}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="secondary">
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="secondary">
                                <Share2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="measurements" className="space-y-6">
            <div className="grid gap-6">
              {measurements.map(measurement => (
                <Card key={measurement.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          {getMeasurementIcon(measurement.type)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{measurement.name}</h3>
                          <p className="text-sm text-muted-foreground">{measurement.project}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {measurement.value} {measurement.unit}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">Doğruluk:</span>
                          <span className="text-sm font-medium">{measurement.accuracy}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{new Date(measurement.date).toLocaleDateString('tr-TR')}</span>
                        <Badge variant="outline" className="capitalize">
                          {measurement.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <FileText className="w-4 h-4 mr-1" />
                          Detaylar
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="w-4 h-4 mr-1" />
                          Paylaş
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="models" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {models.map(model => (
                <Card key={model.id} className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                      {getModelIcon(model.type)}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{model.name}</h3>
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex justify-between">
                        <span>Tür:</span>
                        <Badge variant="outline" className="capitalize">
                          {model.type}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Boyut:</span>
                        <span>{model.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vertices:</span>
                        <span>{model.vertices.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Faces:</span>
                        <span>{model.faces.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="flex-1">
                        <Download className="w-4 h-4 mr-1" />
                        İndir
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <div className="grid gap-6">
              {projects.map(project => (
                <Card key={project.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{project.name}</h3>
                        <p className="text-sm text-muted-foreground">{project.location}</p>
                      </div>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Tür</p>
                        <p className="font-medium">{project.type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">İlerleme</p>
                        <div className="flex items-center gap-2">
                          <Progress value={project.progress} className="flex-1 h-2" />
                          <span className="text-sm font-medium">{project.progress}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Son Güncelleme</p>
                        <p className="font-medium">{new Date(project.lastUpdated).toLocaleDateString('tr-TR')}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Box className="w-4 h-4" />
                          {models.filter(m => m.project === project.name).length} model
                        </div>
                        <div className="flex items-center gap-1">
                          <Ruler className="w-4 h-4" />
                          {measurements.filter(m => m.project === project.name).length} ölçüm
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Scan className="w-4 h-4 mr-1" />
                          Tara
                        </Button>
                        <Button size="sm">
                          <FileText className="w-4 h-4 mr-1" />
                          Detaylar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}